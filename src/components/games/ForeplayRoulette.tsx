import { useEffect, useRef, useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { eligiblePool, shuffle } from "@/lib/consent";
import { renderCardText } from "@/lib/textRenderer";
import { useLaceStore } from "@/store/useLaceStore";
import { HUE, type Card, type DeckId } from "@/lib/types";
import type { GameApi } from "@/components/screens/GameScreen";

const TAU = Math.PI * 2;
const N_MAX = 12;
const R_TRACK = 128;
const R_DIAMOND = 108;
const R_POCKET_OUT = 100;
const R_REST = 74;
const R_ROTOR_IN = 50;
const TILT = 0.44;
const LIFT = 0.36;
const W_DROP = 6.2;
const OMEGA_ROTOR = 0.85;
const DIAMONDS = Array.from({ length: 8 }, (_, k) => (k * TAU) / 8 + TAU / 16);

type Phase = "ready" | "track" | "drop" | "pocket" | "caught";
interface BallState {
  th: number;
  om: number;
  r: number;
  zb: number;
  zv: number;
  phi: number;
  phase: Phase;
  off: number;
  prevFret: number;
}
function freshState(): BallState {
  return { th: -Math.PI / 2, om: 0, r: R_TRACK, zb: 0, zv: 0, phi: 0, phase: "ready", off: 0, prevFret: 0 };
}
const wrapPi = (a: number) => {
  a = ((a + Math.PI) % TAU);
  return (a < 0 ? a + TAU : a) - Math.PI;
};
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const CARD_EMPTY: Card = { id: "__empty", category: "action", intensity: "gentle", text: "Nothing in range — ease the intensity.", tags: [] };

export function ForeplayRoulette({ deckId, api }: { deckId: DeckId; api: GameApi }) {
  const store = useLaceStore();
  const ctx = {
    profiles: store.profiles,
    sharedTier: store.sharedTier,
    extraHardTags: store.extraHardTags,
    sessionSkip: store.sessionSkip,
  };
  const { pool, available } = eligiblePool(deckId, ctx);

  const cardsRef = useRef<Card[]>([CARD_EMPTY]);
  const N = useRef(1);
  const SEG = useRef(TAU);

  const rotorRef = useRef<SVGGElement>(null);
  const rotorArmsRef = useRef<SVGGElement>(null);
  const diamondsRef = useRef<SVGGElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);
  const ballShadowRef = useRef<SVGEllipseElement>(null);
  const chargeRef = useRef<SVGPathElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRootRef = useRef<SVGSVGElement>(null);

  const S = useRef<BallState>(freshState());
  const spinRnd = useRef<() => number>(Math.random);
  const rafRef = useRef<number | null>(null);
  const idleRafRef = useRef<number | null>(null);
  const chargingRef = useRef(false);
  const chargeStartRef = useRef(0);
  const chargeMaxedRef = useRef(false);
  const chargeRafRef = useRef<number | null>(null);
  const lastCardRef = useRef<Card | null>(null);
  const preUndo = useRef<{ turn: 0 | 1; card: Card } | null>(null);

  const dragging = useRef(false);
  const dragPid = useRef<number | null>(null);
  const dragHistory = useRef<{ a: number; t: number }[]>([]);

  const [spinLabel, setSpinLabel] = useState("Hold to wind");
  const [spinDisabled, setSpinDisabled] = useState(false);
  const [readout, setReadout] = useState({ omega: "0.0", phase: "ready" });
  const [result, setResult] = useState<Card | null>(null);
  const [state, setBoxState] = useState<"idle" | "charging" | "spinning" | "result">("idle");

  // (re)build the wheel whenever the eligible pool changes
  useEffect(() => {
    const src = available.length ? available : [CARD_EMPTY];
    cardsRef.current = shuffle(src).slice(0, N_MAX);
    N.current = cardsRef.current.length;
    SEG.current = TAU / N.current;
    buildPockets();
    setResult(null);
    setBoxState("idle");
    api.registerUndo(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, store.sharedTier, store.extraHardTags.join(","), store.sessionSkip.join(",")]);

  function buildPockets() {
    if (!rotorRef.current || !rotorArmsRef.current || !diamondsRef.current) return;
    const cards = cardsRef.current;
    const n = N.current;
    const seg = SEG.current;
    let pockets = "";
    for (let i = 0; i < n; i++) {
      const a1 = i * seg;
      const a2 = (i + 1) * seg;
      const P = (r: number, a: number): [string, string] => [(r * Math.cos(a)).toFixed(2), (r * Math.sin(a)).toFixed(2)];
      const [x1, y1] = P(R_POCKET_OUT, a1);
      const [x2, y2] = P(R_POCKET_OUT, a2);
      const [x3, y3] = P(R_ROTOR_IN, a2);
      const [x4, y4] = P(R_ROTOR_IN, a1);
      const c = HUE[cards[i].intensity] || HUE.gentle;
      const dark = i % 2 === 0;
      pockets += `<path class="bowl-pocket" data-i="${i}" fill="${c}" style="color:${c}" opacity="${dark ? 0.92 : 0.62}"
        d="M${x1} ${y1} A${R_POCKET_OUT} ${R_POCKET_OUT} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${R_ROTOR_IN} ${R_ROTOR_IN} 0 0 0 ${x4} ${y4} Z"/>`;
    }
    let frets = "";
    for (let i = 0; i < n; i++) {
      const a = i * seg;
      frets += `<line class="bowl-fret" x1="${(R_ROTOR_IN * Math.cos(a)).toFixed(2)}" y1="${(R_ROTOR_IN * Math.sin(a)).toFixed(2)}"
        x2="${(R_POCKET_OUT * Math.cos(a)).toFixed(2)}" y2="${(R_POCKET_OUT * Math.sin(a)).toFixed(2)}"/>`;
    }
    rotorRef.current.innerHTML =
      pockets + frets + `<circle fill="none" stroke="rgba(251,240,245,.22)" stroke-width="1" r="${R_POCKET_OUT}"/><circle fill="none" stroke="rgba(251,240,245,.22)" stroke-width="1" r="${R_ROTOR_IN}"/>`;
    rotorArmsRef.current.innerHTML = `<line stroke="rgba(251,240,245,.45)" stroke-width="1.6" stroke-linecap="round" x1="-34" y1="0" x2="34" y2="0"/><line stroke="rgba(251,240,245,.45)" stroke-width="1.6" stroke-linecap="round" x1="0" y1="-34" x2="0" y2="34"/>`;
    diamondsRef.current.innerHTML = DIAMONDS.map((a, k) => {
      const x = (R_DIAMOND * Math.cos(a)).toFixed(2);
      const y = (R_DIAMOND * Math.sin(a)).toFixed(2);
      return `<rect class="bowl-diamond" data-k="${k}" x="-5" y="-5" width="10" height="10" rx="1.4" transform="translate(${x},${y}) rotate(45)"/>`;
    }).join("");
  }

  function advance(st: BallState, dt: number, rnd: () => number, ev: { type: string; k?: number; v?: number }[]) {
    st.phi += OMEGA_ROTOR * dt;
    const prevTh = st.th;
    if (st.phase === "track") {
      st.om *= Math.pow(0.9962, dt * 60);
      st.om -= Math.sign(st.om) * 0.26 * dt;
      st.th += st.om * dt;
      if (Math.abs(st.om) < W_DROP) {
        st.phase = "drop";
        ev.push({ type: "drop" });
      }
    } else if (st.phase === "drop") {
      st.om *= Math.pow(0.992, dt * 60);
      st.om -= Math.sign(st.om) * 0.4 * dt;
      st.th += st.om * dt;
      st.r += (R_POCKET_OUT - 4 - st.r) * 2.6 * dt;
      if (st.r < R_DIAMOND + 9 && st.r > R_DIAMOND - 14) {
        for (let k = 0; k < DIAMONDS.length; k++) {
          const a = wrapPi(prevTh - DIAMONDS[k]);
          const b = wrapPi(st.th - DIAMONDS[k]);
          if (Math.sign(a) !== Math.sign(b) && Math.abs(a) < 0.6 && Math.abs(b) < 0.6) {
            const keep = 0.42 + rnd() * 0.38;
            const flip = rnd() < 0.16;
            st.om = flip ? -st.om * keep * 0.6 : st.om * keep;
            st.zv += 26 + rnd() * 40;
            st.r -= 5 + rnd() * 7;
            ev.push({ type: "diamond", k, v: Math.abs(st.om) });
            break;
          }
        }
      }
      if (st.r <= R_POCKET_OUT - 3) st.phase = "pocket";
    } else if (st.phase === "pocket") {
      st.r += (R_REST - st.r) * 3.4 * dt;
      st.zv -= 700 * dt;
      st.zb += st.zv * dt;
      if (st.zb <= 0) {
        st.zb = 0;
        if (st.zv < -14) {
          st.zv = -st.zv * 0.4;
          ev.push({ type: "bounce", v: Math.abs(st.zv) });
        } else st.zv = 0;
        st.om += (OMEGA_ROTOR - st.om) * 0.26;
      }
      st.om -= Math.sign(st.om - OMEGA_ROTOR) * 1.7 * dt;
      st.th += st.om * dt;
      const fi = Math.floor((((st.th - st.phi) % TAU) + TAU) % TAU / SEG.current);
      if (fi !== st.prevFret) {
        ev.push({ type: "fret", v: Math.abs(st.om - OMEGA_ROTOR) });
        st.prevFret = fi;
      }
      if (Math.abs(st.om - OMEGA_ROTOR) < 0.85 && st.zb < 0.4 && Math.abs(st.r - R_REST) < 3) {
        st.phase = "caught";
        st.off = st.th - st.phi;
        ev.push({ type: "caught" });
      }
    } else if (st.phase === "caught") {
      st.th = st.phi + st.off;
    }
    return st;
  }
  function pocketOf(st: BallState) {
    const rel = (((st.th - st.phi) % TAU) + TAU) % TAU;
    return Math.floor(rel / SEG.current) % N.current;
  }

  function draw() {
    const st = S.current;
    const x = 150 + st.r * Math.cos(st.th);
    const yFlat = 150 + st.r * Math.sin(st.th) * TILT;
    const h = (st.r - R_REST) * LIFT + st.zb;
    ballRef.current?.setAttribute("cx", x.toFixed(2));
    ballRef.current?.setAttribute("cy", (yFlat - h).toFixed(2));
    if (ballShadowRef.current) {
      const k = Math.min(1, Math.max(0.28, 1 - h / 46));
      ballShadowRef.current.setAttribute("cx", x.toFixed(2));
      ballShadowRef.current.setAttribute("cy", yFlat.toFixed(2));
      ballShadowRef.current.setAttribute("rx", (5 * k).toFixed(2));
      ballShadowRef.current.setAttribute("ry", (2.1 * k).toFixed(2));
      ballShadowRef.current.setAttribute("opacity", (0.18 + k * 0.4).toFixed(2));
    }
    const deg = (st.phi * 180) / Math.PI;
    rotorRef.current?.setAttribute("transform", `rotate(${deg})`);
    rotorArmsRef.current?.setAttribute("transform", `rotate(${deg})`);
    setReadout({
      omega: Math.abs(st.om).toFixed(1),
      phase: { ready: "ready", track: "on the track", drop: "leaving the track", pocket: "rattling", caught: "settled" }[st.phase],
    });
  }

  function land() {
    const st = S.current;
    const i = pocketOf(st);
    const card = cardsRef.current[i];
    lastCardRef.current = card;
    setBoxState("result");
    rotorRef.current?.querySelectorAll(".bowl-pocket").forEach((p) => {
      p.classList.toggle("win", Number((p as HTMLElement).dataset.i) === i);
    });
    setResult(card);
    setSpinDisabled(false);
    setSpinLabel("Hold to wind");
    navigator.vibrate?.([12, 50, 16]);
    if (card.id !== "__empty") {
      preUndo.current = { turn: store.turn, card };
      store.recordDeal();
      api.registerUndo(() => {
        if (!preUndo.current) return;
        store.undoDeal(preUndo.current.turn);
        setResult(null);
        setBoxState("idle");
        api.registerUndo(null);
      });
    }
  }

  function loop() {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.045, (now - last) / 1000);
      last = now;
      const ev: { type: string; k?: number; v?: number }[] = [];
      advance(S.current, dt, spinRnd.current, ev);
      for (const e of ev) {
        if (e.type === "diamond") {
          navigator.vibrate?.(16);
          const d = diamondsRef.current?.querySelector(`[data-k="${e.k}"]`);
          if (d) {
            d.classList.add("hit");
            setTimeout(() => d.classList.remove("hit"), 420);
          }
        }
        if (e.type === "caught") land();
      }
      draw();
      if (S.current.phase === "caught" || S.current.phase === "ready") {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }

  function launch(w0: number) {
    const seed = Math.floor(Math.random() * 1e9);
    spinRnd.current = rng(seed);
    const st = S.current;
    st.om = w0 < 0 ? w0 : -w0;
    st.r = R_TRACK;
    st.zb = 0;
    st.zv = 0;
    st.phase = "track";
    st.prevFret = 0;
    setBoxState("spinning");
    setResult(null);
    rotorRef.current?.querySelectorAll(".bowl-pocket").forEach((p) => p.classList.remove("win"));
    setSpinDisabled(true);
    setSpinLabel("Rolling");
    loop();
  }

  function chargeArc(p: number) {
    const r = 150;
    const a0 = -Math.PI / 2;
    const a1 = a0 - p * TAU * 0.85;
    const x0 = (r * Math.cos(a0)).toFixed(2);
    const y0 = (r * Math.sin(a0)).toFixed(2);
    const x1 = (r * Math.cos(a1)).toFixed(2);
    const y1 = (r * Math.sin(a1)).toFixed(2);
    chargeRef.current?.setAttribute("d", p <= 0.001 ? "" : `M${x0} ${y0} A${r} ${r} 0 ${p * 0.85 > 0.5 ? 1 : 0} 0 ${x1} ${y1}`);
  }

  function angleFromClient(clientX: number, clientY: number) {
    const svg = svgRootRef.current;
    if (!svg) return 0;
    const r = svg.getBoundingClientRect();
    const vbX = ((clientX - r.left) / r.width) * 300;
    const vbY = ((clientY - r.top) / r.height) * 300;
    return Math.atan2((vbY - 150) / TILT, vbX - 150);
  }

  /**
   * Direct wheel flick — an alternative to hold-to-wind. Grabbing is allowed
   * any time the ball isn't actively falling or rattling (mirrors the hold
   * button's own guard), and exit velocity comes from recent pointer history,
   * same as the original prototype's flick gesture.
   */
  function onWheelPointerDown(e: React.PointerEvent) {
    if (["drop", "pocket"].includes(S.current.phase)) return;
    dragging.current = true;
    dragPid.current = e.pointerId;
    boxRef.current?.setPointerCapture?.(e.pointerId);
    S.current.phase = "ready";
    S.current.om = 0;
    S.current.r = R_TRACK;
    setBoxState("idle");
    setResult(null);
    rotorRef.current?.querySelectorAll(".bowl-pocket").forEach((p) => p.classList.remove("win"));
    dragHistory.current = [{ a: angleFromClient(e.clientX, e.clientY), t: performance.now() }];
  }
  function onWheelPointerMove(e: React.PointerEvent) {
    if (!dragging.current || e.pointerId !== dragPid.current) return;
    const a = angleFromClient(e.clientX, e.clientY);
    const prev = dragHistory.current[dragHistory.current.length - 1];
    let d = a - prev.a;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    S.current.th += d;
    dragHistory.current.push({ a, t: performance.now() });
    if (dragHistory.current.length > 6) dragHistory.current.shift();
    draw();
  }
  function onWheelPointerUp(e: React.PointerEvent) {
    if (!dragging.current || e.pointerId !== dragPid.current) return;
    dragging.current = false;
    dragPid.current = null;
    if (dragHistory.current.length >= 2) {
      const a0 = dragHistory.current[0];
      const a1 = dragHistory.current[dragHistory.current.length - 1];
      let d = a1.a - a0.a;
      while (d > Math.PI) d -= TAU;
      while (d < -Math.PI) d += TAU;
      const v = d / Math.max(0.016, (a1.t - a0.t) / 1000);
      if (Math.abs(v) > 3) launch(Math.min(34, Math.max(-34, v)));
    }
  }

  function startCharge() {
    if (["track", "drop", "pocket"].includes(S.current.phase)) return;
    chargingRef.current = true;
    chargeMaxedRef.current = false;
    chargeStartRef.current = performance.now();
    setBoxState("charging");
    setSpinLabel("Let go");
    const t0 = chargeStartRef.current;
    const c = (now: number) => {
      if (!chargingRef.current) return;
      const p = Math.min(1, Math.max(0, (now - t0) / 1300));
      chargeArc(p);
      S.current.th = -Math.PI / 2 - p * 0.55;
      S.current.r = R_TRACK;
      draw();
      if (p >= 1 && !chargeMaxedRef.current) {
        chargeMaxedRef.current = true;
        navigator.vibrate?.(18);
      }
      chargeRafRef.current = requestAnimationFrame(c);
    };
    chargeRafRef.current = requestAnimationFrame(c);
    navigator.vibrate?.(6);
  }
  function releaseCharge() {
    if (!chargingRef.current) return;
    chargingRef.current = false;
    if (chargeRafRef.current) cancelAnimationFrame(chargeRafRef.current);
    chargeArc(0);
    const p = Math.min(1, Math.max(0, (performance.now() - chargeStartRef.current) / 1300));
    launch(-(14 + p * 17));
  }

  useEffect(() => {
    const up = () => releaseCharge();
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // rotor keeps turning even at rest
  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.045, (now - last) / 1000);
      last = now;
      const st = S.current;
      if (st.phase === "caught" || st.phase === "ready") {
        st.phi += OMEGA_ROTOR * dt;
        if (st.phase === "caught") st.th = st.phi + st.off;
        draw();
      }
      idleRafRef.current = requestAnimationFrame(tick);
    };
    idleRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <p className="px-6 pt-1.5 text-center text-[12px] leading-snug text-silk-faint">
        Hold the button to wind up, or flick the wheel with your finger.
      </p>
      <div className="relative flex flex-1 items-center justify-center" style={{ touchAction: "none" }}>
        <div
          ref={boxRef}
          className="relative w-[min(320px,88vw)] cursor-grab active:cursor-grabbing"
          style={{ aspectRatio: "1" }}
          data-state={state}
          onPointerDown={onWheelPointerDown}
          onPointerMove={onWheelPointerMove}
          onPointerUp={onWheelPointerUp}
          onPointerCancel={onWheelPointerUp}
        >
          <svg ref={svgRootRef} viewBox="0 0 300 300" className="block w-full overflow-visible">
            <defs>
              <radialGradient id="gBowl" cx="50%" cy="30%" r="74%">
                <stop offset="0%" stopColor="#3C2650" />
                <stop offset="58%" stopColor="#241535" />
                <stop offset="100%" stopColor="#140B1E" />
              </radialGradient>
              <linearGradient id="gTrack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#523566" />
                <stop offset="48%" stopColor="#28183A" />
                <stop offset="100%" stopColor="#442C58" />
              </linearGradient>
              <radialGradient id="gApron" cx="50%" cy="26%" r="72%">
                <stop offset="0%" stopColor="#2E1C40" />
                <stop offset="100%" stopColor="#180E26" />
              </radialGradient>
              <radialGradient id="gBall" cx="33%" cy="28%" r="72%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="52%" stopColor="#EADEEC" />
                <stop offset="100%" stopColor="#8E7E9C" />
              </radialGradient>
            </defs>
            <g transform="translate(150,150) scale(1,0.44)">
              <circle className="bowl-outer" r={143} />
              <circle className="bowl-lip" r={143} />
              <circle className="bowl-track-edge" r={135} />
              <circle className="bowl-track" r={128} />
              <circle className="bowl-track-edge" r={121} />
              <circle className="bowl-apron" r={119} />
              <g ref={diamondsRef} />
              <g ref={rotorRef} />
              <circle r={50} fill="#241535" />
              <g ref={rotorArmsRef} />
              <path ref={chargeRef} fill="none" stroke="var(--amber)" strokeWidth={3} strokeLinecap="round" opacity={state === "charging" ? 0.9 : 0} />
            </g>
            <ellipse cx={150} cy={150} rx={17} ry={7.5} fill="#7A5490" stroke="rgba(251,240,245,.3)" />
            <ellipse ref={ballShadowRef} className="fill-black/55" rx={5} ry={2.1} />
            <circle ref={ballRef} className="bowl-ball" r={5.3} />
          </svg>
        </div>
      </div>

      <div className="flex justify-between px-[22px] text-[11px] text-silk-faint">
        <span>
          ball <b className="text-silk-dim">{readout.omega}</b>
        </span>
        <span className="text-violet">{readout.phase}</span>
        <span>{pool.length} in range</span>
      </div>

      {result && (
        <div className="lace-card mx-5 mt-2 rounded-card border p-[18px]">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full border px-2.5 py-[3px] text-[10.5px] font-semibold"
              style={{ color: HUE[result.intensity] || "var(--silk-faint)", borderColor: HUE[result.intensity] || "var(--silk-faint)" }}
            >
              {result.intensity}
            </span>
            <span className="text-[11.5px] text-silk-faint">{result.category[0].toUpperCase() + result.category.slice(1)}</span>
          </div>
          <p className="font-display mt-2 text-[19px] leading-snug">
            {result.id === "__empty" ? result.text : renderCardText(result.text, store.profiles[store.turn], store.profiles[1 - store.turn])}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 px-5 pb-2.5 pt-2.5">
        <Button variant="ghost" disabled={!lastCardRef.current || lastCardRef.current.id === "__empty"} onClick={() => lastCardRef.current && api.requestPass(lastCardRef.current)}>
          Pass
        </Button>
        <Button disabled={spinDisabled} onPointerDown={(e) => { e.preventDefault(); startCharge(); }}>
          {spinLabel}
        </Button>
      </div>
    </div>
  );
}
