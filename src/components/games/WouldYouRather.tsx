import { useEffect, useRef, useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { eligiblePool, shuffle } from "@/lib/consent";
import { parseWouldYouRather, renderCardText } from "@/lib/textRenderer";
import { useLaceStore } from "@/store/useLaceStore";
import type { Card, DeckId } from "@/lib/types";
import type { GameApi } from "@/components/screens/GameScreen";

export function WouldYouRather({ deckId, api }: { deckId: DeckId; api: GameApi }) {
  const store = useLaceStore();
  const ctx = {
    profiles: store.profiles,
    sharedTier: store.sharedTier,
    extraHardTags: store.extraHardTags,
    sessionSkip: store.sessionSkip,
  };
  const { pool, available } = eligiblePool(deckId, ctx);

  const [current, setCurrent] = useState<Card | null>(null);
  const [lean, setLean] = useState(0.5);
  const [locked, setLocked] = useState(false);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startLean = useRef(0.5);
  const splitRef = useRef<HTMLDivElement>(null);
  const preUndo = useRef<{ turn: 0 | 1; card: Card } | null>(null);

  function newCard() {
    if (!available.length) {
      setCurrent(null);
      return;
    }
    setCurrent(shuffle(available)[0]);
    setLocked(false);
    setLean(0.5);
    api.registerUndo(null);
  }

  useEffect(() => {
    newCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, store.sharedTier, store.extraHardTags.join(","), store.sessionSkip.join(",")]);

  const rendered = current ? renderCardText(current.text, store.profiles[store.turn], store.profiles[1 - store.turn]) : "";
  const [optA, optB] = current ? parseWouldYouRather(rendered) : ["", ""];
  const a = Math.min(0.94, Math.max(0.06, lean));
  const pctA = Math.round((1 - a) * 100);

  function onPointerDown(e: React.PointerEvent) {
    if (locked || !current) return;
    dragging.current = true;
    startY.current = e.clientY;
    startLean.current = lean;
    splitRef.current?.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !splitRef.current) return;
    const h = splitRef.current.getBoundingClientRect().height;
    const next = Math.min(1, Math.max(0, startLean.current + ((e.clientY - startY.current) / h) * 1.5));
    if (Math.abs(next - lean) > 0.05 && navigator.vibrate) navigator.vibrate(3);
    setLean(next);
  }
  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (!locked) setLean(0.5 + (lean - 0.5) * 0.34); // leaning is free; only Commit locks it
  }

  function commit() {
    if (!current || locked) return;
    setLocked(true);
    setLean(lean >= 0.5 ? 0.9 : 0.1);
    if (navigator.vibrate) navigator.vibrate([10, 40, 14]);
    preUndo.current = { turn: store.turn, card: current };
    store.recordDeal();
    api.registerUndo(() => {
      if (!preUndo.current) return;
      store.undoDeal(preUndo.current.turn);
      setLocked(false);
      setLean(0.5);
      api.registerUndo(null);
    });
    setTimeout(newCard, 900);
  }

  function skip() {
    if (!current) return;
    api.requestPass(current);
    store.toggleTurn();
    newCard();
  }

  return (
    <div className="flex flex-1 flex-col gap-2.5 px-5">
      <div className="font-display pt-1 text-center text-[17px] text-silk-dim">Would you rather</div>
      <div ref={splitRef} className="relative flex flex-1 flex-col gap-2.5" style={{ cursor: "ns-resize" }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <Half text={optA} pct={pctA} flexBasis={1 - a} lead={pctA > 52} tone="rose" />
        <Half text={optB} pct={100 - pctA} flexBasis={a} lead={pctA < 48} tone="powder" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[4] -translate-x-1/2 -translate-y-1/2">
          <span className="font-display rounded-full border border-hairline bg-ink px-3 py-[3px] text-[13px] italic text-silk-faint">
            or
          </span>
        </div>
      </div>
      <p className="pb-0.5 text-center text-[11px] text-silk-faint">
        {pool.length} card{pool.length === 1 ? "" : "s"} in range
      </p>
      <div className="grid grid-cols-2 gap-2.5 pb-2.5">
        <Button variant="ghost" disabled={!current} onClick={skip}>
          Pass
        </Button>
        <Button disabled={!current || locked} onClick={commit}>
          {locked ? "Committed" : "Commit"}
        </Button>
      </div>
    </div>
  );
}

function Half({
  text,
  pct,
  flexBasis,
  lead,
  tone,
}: {
  text: string;
  pct: number;
  flexBasis: number;
  lead: boolean;
  tone: "rose" | "powder";
}) {
  return (
    <div
      className="relative flex items-center overflow-hidden rounded-[20px] border px-5 py-[18px] transition-[border-color,box-shadow,flex]"
      style={{
        flex: `${flexBasis} 1 0%`,
        borderColor: lead ? "color-mix(in srgb, var(--accent) 55%, transparent)" : "rgba(251,240,245,.14)",
        background: "linear-gradient(150deg, var(--ink-3), var(--ink-2))",
        boxShadow: lead
          ? `0 0 28px -8px ${tone === "rose" ? "rgba(255,77,157,.55)" : "rgba(143,194,255,.55)"}`
          : "none",
      }}
    >
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity: 0.14 + (pct / 100) * 0.5,
          background:
            tone === "rose"
              ? "linear-gradient(120deg, rgba(255,77,157,.5), transparent 72%)"
              : "linear-gradient(120deg, rgba(143,194,255,.5), transparent 72%)",
        }}
      />
      <span className="font-display relative text-[18px] font-normal leading-[1.24] tracking-[-0.015em]">{text}</span>
      <span className="absolute bottom-[11px] right-4 text-[10.5px] text-silk-faint">{pct}%</span>
    </div>
  );
}
