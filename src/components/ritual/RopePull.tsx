import { useEffect, useRef, useState } from "react";
import { TIERS } from "@/lib/types";

interface RopePullProps {
  nameA: string;
  nameB: string;
  baseline: number; // 0..3, floor from the private check (min of both)
  higher: number; // 0..3, the higher of the two private answers
  onConfirmed: (mergedTier: number) => void;
}

const W = 340;
const CY = 130;
const AX = 40;
const BX = 300;

export function RopePull({ nameA, nameB, baseline, higher, onConfirmed }: RopePullProps) {
  const pullA = useRef(0);
  const pullB = useRef(0);
  const activeA = useRef(false);
  const activeB = useRef(false);
  const pidA = useRef<number | null>(null);
  const pidB = useRef<number | null>(null);
  const holdStart = useRef(0);
  const holding = useRef(false);
  const confirmed = useRef(false);
  const [solo, setSolo] = useState(false);
  const soloRef = useRef(false);
  soloRef.current = solo;

  const svgRef = useRef<SVGSVGElement>(null);
  const ropeLine = useRef<SVGPathElement>(null);
  const ropeCore = useRef<SVGPathElement>(null);
  const handleA = useRef<SVGGElement>(null);
  const handleB = useRef<SVGGElement>(null);
  const holdG = useRef<SVGGElement>(null);
  const holdArc = useRef<SVGCircleElement>(null);
  const [tierLine, setTierLine] = useState(TIERS[Math.round(baseline)]);
  const [slack, setSlack] = useState("loose");
  const [hint, setHint] = useState("pull evenly, together");
  const [rootAccent, setRootAccent] = useState("var(--rose)");

  function accentFor(t: number) {
    const idx = Math.max(0, Math.min(3, Math.round(t)));
    return ["var(--powder)", "var(--rose)", "var(--violet)", "#FF6BA8"][idx];
  }

  function sagFor(t: number) {
    return (1 - t) * 70 + 6;
  }

  function render() {
    const tension = Math.min(pullA.current, pullB.current);
    const cx = W / 2;
    const hxA = cx - pullA.current * (cx - AX - 20) - 20;
    const hxB = cx + pullB.current * (BX - cx - 20) + 20;
    const sag = sagFor(tension);
    const midY = CY + sag;
    const d = `M${AX} ${CY} Q${cx} ${midY} ${BX} ${CY}`;
    ropeLine.current?.setAttribute("d", d);
    ropeCore.current?.setAttribute("d", d);
    const hyA = CY + (1 - pullA.current) * sag * 0.55;
    const hyB = CY + (1 - pullB.current) * sag * 0.55;
    handleA.current?.setAttribute("transform", `translate(${hxA.toFixed(1)},${hyA.toFixed(1)})`);
    handleB.current?.setAttribute("transform", `translate(${hxB.toFixed(1)},${hyB.toFixed(1)})`);
    handleA.current?.classList.toggle("active", activeA.current);
    handleB.current?.classList.toggle("active", activeB.current);
    holdG.current?.setAttribute("transform", `translate(${((hxA + hxB) / 2).toFixed(1)},${((hyA + hyB) / 2).toFixed(1)})`);

    const cap = Math.min(3, Math.max(higher, baseline) + 1);
    const merged = Math.max(0, Math.min(3, baseline + tension * (cap - baseline)));
    setRootAccent(accentFor(merged));
    setTierLine(TIERS[Math.max(0, Math.min(3, Math.round(merged)))]);
    setSlack(tension < 0.12 ? "loose" : tension < 0.4 ? "easing in" : tension < 0.75 ? "drawing taut" : "taut");
    setHint(confirmed.current ? "held ✓" : activeA.current && activeB.current ? "hold steady…" : "pull evenly, together");
    return merged;
  }

  function checkHold(merged: number) {
    const tension = Math.min(pullA.current, pullB.current);
    const bothOn = activeA.current && activeB.current && tension > 0.15;
    if (bothOn) {
      holdG.current?.setAttribute("opacity", "1");
      if (!holding.current) {
        holding.current = true;
        holdStart.current = performance.now();
      }
      const p = Math.min(1, (performance.now() - holdStart.current) / 900);
      holdArc.current?.setAttribute("stroke-dashoffset", String(126 * (1 - p)));
      if (p >= 1 && !confirmed.current) {
        confirmed.current = true;
        if (navigator.vibrate) navigator.vibrate([16, 50, 16, 50, 20]);
        setTimeout(() => onConfirmed(merged), 420);
      }
    } else {
      holding.current = false;
      holdG.current?.setAttribute("opacity", "0");
      holdArc.current?.setAttribute("stroke-dashoffset", "126");
    }
  }

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (confirmed.current) return;
      if (soloRef.current && !activeB.current) {
        pullB.current = Math.min(1, Math.max(0, pullB.current + (activeA.current ? 0.014 : -0.01)));
      } else if (!activeB.current) {
        pullB.current = Math.max(0, pullB.current - 0.02);
      }
      if (!activeA.current) pullA.current = Math.max(0, pullA.current - 0.02);
      const merged = render();
      checkHold(merged);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function localX(clientX: number) {
    const r = svgRef.current!.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * W;
  }

  return (
    <div className="flex flex-1 flex-col pt-1.5">
      <div className="px-[26px] text-center">
        <h2 className="font-display text-[20px] font-medium tracking-[-0.016em]">Pull together</h2>
        <p className="mt-1 text-[12px] leading-normal text-silk-faint">
          One thumb each, on your own end. Pull evenly and hold — it only tightens if you both mean it.
        </p>
      </div>

      <div className="relative my-1.5 flex-1" style={{ touchAction: "none" }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} 260`} preserveAspectRatio="none" className="block h-full w-full">
          <path ref={ropeCore} className="rope-core" d="" />
          <path ref={ropeLine} className="rope-line" d="" />

          <g
            ref={handleA}
            className="rope-handle cursor-grab"
            onPointerDown={(e) => {
              pidA.current = e.pointerId;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              activeA.current = true;
              if (navigator.vibrate) navigator.vibrate(6);
            }}
            onPointerMove={(e) => {
              if (e.pointerId !== pidA.current) return;
              const cx = W / 2;
              const x = localX(e.clientX);
              pullA.current = Math.min(1, Math.max(0, (cx - 20 - x) / (cx - 20 - AX - 20)));
            }}
            onPointerUp={(e) => {
              if (e.pointerId !== pidA.current) return;
              pidA.current = null;
              activeA.current = false;
            }}
            onPointerCancel={() => {
              pidA.current = null;
              activeA.current = false;
            }}
          >
            <circle className="ring" r={22} />
            <circle className="core" r={7} />
            <text y={38} textAnchor="middle" fontSize={10.5} className="fill-silk-faint">
              {nameA}
            </text>
          </g>

          <g
            ref={handleB}
            className="rope-handle cursor-grab"
            onPointerDown={(e) => {
              pidB.current = e.pointerId;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              activeB.current = true;
              if (navigator.vibrate) navigator.vibrate(6);
            }}
            onPointerMove={(e) => {
              if (e.pointerId !== pidB.current) return;
              const cx = W / 2;
              const x = localX(e.clientX);
              pullB.current = Math.min(1, Math.max(0, (x - (cx + 20)) / (BX - 20 - (cx + 20))));
            }}
            onPointerUp={(e) => {
              if (e.pointerId !== pidB.current) return;
              pidB.current = null;
              activeB.current = false;
            }}
            onPointerCancel={() => {
              pidB.current = null;
              activeB.current = false;
            }}
          >
            <circle className="ring" r={22} />
            <circle className="core" r={7} />
            <text y={38} textAnchor="middle" fontSize={10.5} className="fill-silk-faint">
              {nameB}
            </text>
          </g>

          <g ref={holdG} transform="translate(170,130)" opacity={0}>
            <circle
              ref={holdArc}
              r={20}
              fill="none"
              stroke="var(--amber)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={126}
              strokeDashoffset={126}
              transform="rotate(-90)"
            />
          </g>
        </svg>
      </div>

      <div className="px-[26px] text-center font-display text-[16.5px] font-medium transition-colors" style={{ color: rootAccent }}>
        {tierLine}
      </div>
      <div className="flex justify-between px-[26px] text-[11px] text-silk-faint">
        <span>
          slack <b className="text-silk-dim">{slack}</b>
        </span>
        <span>{hint}</span>
      </div>
      <div className="px-[26px] pb-0.5 pt-1.5 text-center">
        <button
          onClick={() => setSolo((s) => !s)}
          className={`text-[11.5px] underline decoration-white/10 underline-offset-4 ${solo ? "text-violet" : "text-silk-faint hover:text-silk"}`}
        >
          {solo ? "Solo test: on (release to stop)" : "Testing solo? Simulate a partner"}
        </button>
      </div>
    </div>
  );
}
