import { useRef, useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { eligiblePool } from "@/lib/consent";
import { renderCardText } from "@/lib/textRenderer";
import { useLaceStore } from "@/store/useLaceStore";
import { HUE, TIER_OF, type Card, type DeckId } from "@/lib/types";
import type { GameApi } from "@/components/screens/GameScreen";

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};
const FACE_XF = [
  { t: "translateZ(35px)", v: 1 },
  { t: "rotateY(90deg) translateZ(35px)", v: 2 },
  { t: "rotateX(90deg) translateZ(35px)", v: 3 },
  { t: "rotateX(-90deg) translateZ(35px)", v: 4 },
  { t: "rotateY(-90deg) translateZ(35px)", v: 5 },
  { t: "rotateY(180deg) translateZ(35px)", v: 6 },
];
const TO_FRONT: Record<number, [number, number]> = {
  1: [0, 0],
  2: [0, -90],
  3: [-90, 0],
  4: [90, 0],
  5: [0, 90],
  6: [0, 180],
};
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

function Die({ cubeRef }: { cubeRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div ref={cubeRef} className="dice-cube" style={{ transform: "rotateX(-22deg) rotateY(28deg)" }}>
      {FACE_XF.map((f) => (
        <div key={f.v} className="dice-face" style={{ transform: f.t }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className={PIPS[f.v].includes(i) ? "dice-pip" : ""} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SexyDice({ deckId, api }: { deckId: DeckId; api: GameApi }) {
  const store = useLaceStore();
  const ctx = {
    profiles: store.profiles,
    sharedTier: store.sharedTier,
    extraHardTags: store.extraHardTags,
    sessionSkip: store.sessionSkip,
  };
  const { pool, available } = eligiblePool(deckId, ctx);

  const cube1 = useRef<HTMLDivElement>(null);
  const cube2 = useRef<HTMLDivElement>(null);
  const shadow1 = useRef<HTMLDivElement>(null);
  const shadow2 = useRef<HTMLDivElement>(null);
  const [rolling, setRolling] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [result, setResult] = useState<Card | null>(null);
  const preUndo = useRef<{ turn: 0 | 1; card: Card } | null>(null);

  function throwDie(
    cube: HTMLDivElement | null,
    shadowEl: HTMLDivElement | null,
    value: number,
    delay: number,
    dur: number,
    onLand?: () => void,
  ) {
    if (!cube || !shadowEl) return;
    const [fx, fy] = TO_FRONT[value];
    const sx = (Math.random() * 2 - 1) * 90;
    const sy = (Math.random() * 2 - 1) * 90;
    const tx = fx + 360 * (2 + Math.floor(Math.random() * 2));
    const ty = fy + 360 * (2 + Math.floor(Math.random() * 2));
    const t0 = performance.now() + delay;

    function run(now: number) {
      const e = now - t0;
      if (e < 0) {
        requestAnimationFrame(run);
        return;
      }
      const raw = Math.min(1, Math.max(0, e / dur));
      const p = easeOutQuart(raw);
      const rx = sx + (tx - sx) * p;
      const ry = sy + (ty - sy) * p;
      const lift = Math.sin(Math.PI * raw) * 76;
      let squash = 1;
      let sq = 1;
      if (raw >= 1) {
        const s = Math.min(1, Math.max(0, (now - (t0 + dur)) / 420));
        squash = 1 + 0.26 * Math.exp(-s * 9) * Math.cos(s * 30);
        sq = 1 / Math.sqrt(squash);
      }
      cube!.style.transform = `translateY(${-lift}px) rotateX(${rx}deg) rotateY(${ry}deg) scaleY(${squash.toFixed(3)}) scaleX(${sq.toFixed(3)})`;
      const near = 1 - lift / 76;
      shadowEl!.style.transform = `scale(${(0.5 + near * 0.62).toFixed(3)})`;
      shadowEl!.style.opacity = (0.24 + near * 0.62).toFixed(3);
      shadowEl!.style.filter = `blur(${(9 - near * 5.4).toFixed(2)}px)`;
      if (raw < 1 || now < t0 + dur + 420) requestAnimationFrame(run);
      else onLand?.();
    }
    requestAnimationFrame(run);
    setTimeout(() => navigator.vibrate?.(14), delay + dur);
  }

  function roll() {
    if (rolling || !available.length) return;
    setRolling(true);
    setSummary(null);
    setResult(null);
    const v1 = 1 + Math.floor(Math.random() * 6);
    const v2 = 1 + Math.floor(Math.random() * 6);
    const dur = 1250;
    throwDie(cube1.current, shadow1.current, v1, 0, dur);
    throwDie(cube2.current, shadow2.current, v2, 120, dur, () => {
      const dieCap = Math.floor((v2 - 1) / 1.7); // 0..3, independent of the shared ribbon
      const tierPool = pool.filter((c) => TIER_OF[c.intensity] <= dieCap);
      const usePool = tierPool.length ? tierPool : pool;
      const card = usePool[(v1 - 1) % usePool.length];
      setResult(card);
      setSummary(`${v1} · ${v2} — picks the card and caps the intensity`);
      setRolling(false);
      preUndo.current = { turn: store.turn, card };
      store.recordDeal();
      api.registerUndo(() => {
        if (!preUndo.current) return;
        store.undoDeal(preUndo.current.turn);
        setResult(null);
        setSummary(null);
        api.registerUndo(null);
      });
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="dice-scene flex flex-1 items-center justify-center gap-8">
        {[
          { cube: cube1, shadow: shadow1, label: "card" },
          { cube: cube2, shadow: shadow2, label: "intensity" },
        ].map((d, i) => (
          <div key={i} className="relative flex h-[126px] w-[92px] flex-col items-center justify-end">
            <span className="absolute top-0 text-[10.5px] text-silk-faint">{d.label}</span>
            <Die cubeRef={d.cube} />
            <div ref={d.shadow} className="dice-shadow" />
          </div>
        ))}
      </div>

      {summary && (
        <p className="font-display px-5 text-center text-sm text-silk-dim">
          <b className="font-semibold text-accent transition-accent">{summary}</b>
        </p>
      )}

      {result && (
        <div className="lace-card mx-5 mt-2.5 rounded-card border p-[18px]">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full border px-2.5 py-[3px] text-[10.5px] font-semibold"
              style={{ color: HUE[result.intensity], borderColor: HUE[result.intensity] }}
            >
              {result.intensity}
            </span>
            <span className="text-[11.5px] text-silk-faint">{result.category[0].toUpperCase() + result.category.slice(1)}</span>
          </div>
          <p className="font-display mt-2 text-[19px] leading-snug">
            {renderCardText(result.text, store.profiles[store.turn], store.profiles[1 - store.turn])}
          </p>
        </div>
      )}

      <p className="px-5 pt-2 text-center text-[11px] text-silk-faint">{pool.length} in range</p>

      <div className="grid grid-cols-2 gap-2.5 px-5 pb-2.5 pt-2">
        <Button variant="ghost" disabled={!result} onClick={() => result && api.requestPass(result)}>
          Pass
        </Button>
        <Button disabled={rolling || !available.length} onClick={roll}>
          {rolling ? "In the air" : result ? "Throw again" : "Throw"}
        </Button>
      </div>
    </div>
  );
}
