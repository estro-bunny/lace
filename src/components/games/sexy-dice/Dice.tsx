"use client";

// Dot positions for each face of a standard die
const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  label: string;
}

export default function Dice({ value, isRolling, label }: DiceProps) {
  const dots = value ? DOT_POSITIONS[value] : [];

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <div
        className={`
          relative w-24 h-24 md:w-28 md:h-28 rounded-2xl
          bg-gradient-to-br from-surface-container-high to-surface-container
          border border-outline-variant/40
          shadow-[0_0_20px_rgba(255,0,255,0.15)]
          flex items-center justify-center
          transition-transform duration-200
          ${isRolling ? "animate-dice-shake" : ""}
        `}
      >
        <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20">
          {dots.map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="10"
              className="fill-primary"
            />
          ))}
        </svg>
        {!value && !isRolling && (
          <span className="absolute text-3xl text-on-surface-variant/40 select-none">?</span>
        )}
      </div>
      {value && !isRolling && (
        <span className="text-2xl font-black font-headline text-primary">
          {value}
        </span>
      )}
    </div>
  );
}
