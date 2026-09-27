import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AFTERCARE_CARDS } from "@/lib/decks";
import { shuffle } from "@/lib/consent";
import { renderCardText } from "@/lib/textRenderer";
import { useLaceStore } from "@/store/useLaceStore";

export function AftercareFlow({ onFinished }: { onFinished: () => void }) {
  const profiles = useLaceStore((s) => s.profiles);
  const toggleTurn = useLaceStore((s) => s.toggleTurn);
  const turn = useLaceStore((s) => s.turn);
  const order = useMemo(() => shuffle(AFTERCARE_CARDS), []);
  const [idx, setIdx] = useState(0);

  const card = order[idx];
  const [p1, p2] = [profiles[turn], profiles[1 - turn]];
  const isLast = idx >= order.length - 1;

  return (
    <div className="flex flex-1 flex-col justify-center gap-4 px-6 pb-6 pt-2 text-center">
      <div className="rounded-card border border-white/[0.14] bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_13%,var(--ink-3))] to-ink-2 p-6">
        <span className="rounded-full border border-powder px-2.5 py-1 text-[10.5px] font-semibold text-powder">
          aftercare
        </span>
        <p className="font-display mt-4 text-[22px] font-normal leading-snug tracking-[-0.015em]">
          {card ? renderCardText(card.text, p1, p2) : "That's everything."}
        </p>
        <p className="mt-2.5 text-[11.5px] text-silk-faint">
          {idx + 1} of {order.length}
        </p>
      </div>
      <Button
        onClick={() => {
          if (!isLast) {
            setIdx((i) => i + 1);
            toggleTurn();
          } else {
            onFinished();
          }
        }}
      >
        {isLast ? "Done" : "Next"}
      </Button>
    </div>
  );
}
