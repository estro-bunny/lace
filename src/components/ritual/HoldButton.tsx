import { useRef, useState } from "react";

interface HoldButtonProps {
  label: string;
  onConfirm: () => void;
}

export function HoldButton({ label, onConfirm }: HoldButtonProps) {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);
  const startedAt = useRef(0);
  const done = useRef(false);

  function cancel() {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setProgress(0);
  }

  function down() {
    if (done.current) return;
    startedAt.current = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - startedAt.current) / 900);
      setProgress(p);
      if (p >= 1) {
        done.current = true;
        if (navigator.vibrate) navigator.vibrate([14, 40, 14]);
        setTimeout(onConfirm, 160);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  function up() {
    if (!done.current) cancel();
  }

  return (
    <button
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      style={{ touchAction: "manipulation" }}
      className="relative w-[min(240px,80vw)] select-none overflow-hidden rounded-full border border-[var(--thread-lit)] bg-white/[0.04] px-4 py-[18px] text-[14.5px] font-semibold text-silk"
    >
      <div
        className="absolute inset-0 origin-left bg-accent transition-accent"
        style={{ transform: `scaleX(${progress})`, transition: progress === 0 ? "transform .25s ease" : "none" }}
      />
      <span className="relative z-[1] mix-blend-difference">{label}</span>
    </button>
  );
}
