import { useRef } from "react";
import { TIERS } from "@/lib/types";

interface VerticalGaugeProps {
  value: number; // 0..3 float
  onChange: (v: number) => void;
}

export function VerticalGauge({ value, onChange }: VerticalGaugeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function setFromClientY(clientY: number) {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    onChange((1 - p) * 3);
  }

  const y = 310 - (value / 3) * 300;
  const knobPct = (y / 320) * 100;
  const roundedTier = Math.max(0, Math.min(3, Math.round(value)));

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={roundedTier}
        aria-valuetext={TIERS[roundedTier]}
        className="relative flex h-[min(300px,38vh)] justify-center focus:outline-none"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setFromClientY(e.clientY);
        }}
        onPointerMove={(e) => dragging.current && setFromClientY(e.clientY)}
        onPointerUp={() => (dragging.current = false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") onChange(Math.min(3, value + 0.1));
          if (e.key === "ArrowDown") onChange(Math.max(0, value - 0.1));
        }}
      >
        <svg viewBox="0 0 60 320" className="h-full overflow-visible">
          <path d="M30 10 L30 310" stroke="var(--thread)" strokeWidth={10} strokeLinecap="round" fill="none" />
          <path
            d={`M30 310 L30 ${y.toFixed(1)}`}
            stroke="var(--accent)"
            strokeWidth={10}
            strokeLinecap="round"
            fill="none"
            className="transition-accent"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-0.5" style={{ right: "calc(50% + 34px)" }}>
          {[...TIERS].reverse().map((t, i) => (
            <span
              key={t}
              className={`text-right text-[10.5px] ${3 - i === roundedTier ? "font-medium text-silk" : "text-silk-faint"}`}
            >
              {t}
            </span>
          ))}
        </div>
        <div
          className="absolute left-1/2 grid h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-ink bg-accent shadow-[0_6px_18px_-4px_rgba(0,0,0,0.7)] transition-accent"
          style={{ top: `${knobPct}%` }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#1A0710" strokeWidth={2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>
      <div className="font-display text-[15.5px] font-medium text-accent transition-accent">{TIERS[roundedTier]}</div>
    </div>
  );
}
