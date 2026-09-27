const LOOP = "M22 9 C29 9 29 19 22 19 C15 19 15 9 22 9";

export function SessionKnot({ dealtTotal }: { dealtTotal: number }) {
  const on = [dealtTotal >= 2, dealtTotal >= 5, dealtTotal >= 9, dealtTotal >= 14];
  const caption =
    dealtTotal === 0
      ? "Tonight's knot: not tied yet"
      : dealtTotal < 5
        ? `Tonight's knot: ${dealtTotal} card${dealtTotal === 1 ? "" : "s"} in, just starting`
        : dealtTotal < 9
          ? `Tonight's knot: ${dealtTotal} cards in, tightening`
          : dealtTotal < 14
            ? `Tonight's knot: ${dealtTotal} cards in, properly tied`
            : `Tonight's knot: ${dealtTotal} cards in, fully knotted`;

  return (
    <div className="mt-2.5 flex items-center gap-2.5">
      <svg viewBox="0 0 44 44" className="h-[34px] w-[34px] flex-none" aria-hidden="true">
        <circle cx={22} cy={22} r={13} fill="none" stroke="var(--thread-lit)" strokeWidth={1.6} className="transition-accent" />
        {[0, 90, 180, 270].map((rot, i) => (
          <path
            key={rot}
            d={LOOP}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.3}
            transform={`rotate(${rot} 22 22)`}
            className="transition-accent"
            style={{ opacity: on[i] ? 0.9 : 0, transition: "opacity .7s cubic-bezier(.22,.61,.36,1)" }}
          />
        ))}
      </svg>
      <span className="text-[11px] leading-snug text-silk-faint">{caption}</span>
    </div>
  );
}
