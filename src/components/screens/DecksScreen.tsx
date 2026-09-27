import { Printer } from "lucide-react";
import { DECK_META } from "@/lib/decks";
import { eligiblePool } from "@/lib/consent";
import { useLaceStore } from "@/store/useLaceStore";
import { IntensityRibbon } from "@/components/shared/IntensityRibbon";
import { SessionKnot } from "@/components/shared/SessionKnot";
import { useAccent } from "@/lib/useAccent";
import type { DeckId } from "@/lib/types";

interface DecksScreenProps {
  onOpenDeck: (id: DeckId) => void;
  onPrintDeck: (id: DeckId) => void;
}

export function DecksScreen({ onOpenDeck, onPrintDeck }: DecksScreenProps) {
  const store = useLaceStore();
  useAccent(store.sharedTier);

  const ctx = {
    profiles: store.profiles,
    sharedTier: store.sharedTier,
    extraHardTags: store.extraHardTags,
    sessionSkip: store.sessionSkip,
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-[22px] pb-0.5 pt-1.5">
        <h1 className="font-display text-[27px] font-medium tracking-[-0.018em]">Pick your chaos</h1>
        <p className="mt-1 text-[12.5px] text-silk-faint">
          Every deck is filtered through both profiles' limits before a card is dealt. No accidental wildcards.
        </p>
        {store.houseRule && (
          <p className="font-display mt-2 text-[13px] italic text-accent transition-accent">"{store.houseRule}"</p>
        )}
        <SessionKnot dealtTotal={store.dealtTotal} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-[11px] px-5 pb-2 pt-3.5">
          {DECK_META.map((d) => {
            const { available } = eligiblePool(d.id, ctx);
            const total = (
              store.profiles.length ? eligiblePool(d.id, { ...ctx, sharedTier: 3, extraHardTags: [] }).pool : []
            ).length;
            const empty = available.length === 0;
            return (
              <div
                key={d.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenDeck(d.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenDeck(d.id)}
                style={{ ["--dc" as string]: d.accentVar }}
                className="relative cursor-pointer overflow-hidden rounded-[20px] border border-white/[0.14] p-[15px] text-left transition-transform hover:-translate-y-0.5 hover:border-white/[0.28] active:scale-[0.98]"
              >
                <div
                  className="absolute inset-0 -z-10"
                  style={{ background: `linear-gradient(168deg, var(--dc) 0%, var(--ink-2) 62%)` }}
                />
                {empty && (
                  <span className="absolute right-[11px] top-[11px] rounded-full border border-stop/35 bg-stop/[0.14] px-1.5 py-0.5 text-[9.5px] font-semibold text-stop">
                    none in range
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrintDeck(d.id);
                  }}
                  disabled={empty}
                  aria-label={`Print ${d.name}`}
                  className="absolute bottom-[11px] right-[11px] rounded-full border border-hairline bg-black/20 p-1.5 text-silk-faint transition-colors hover:border-white/30 hover:text-silk disabled:opacity-30"
                >
                  <Printer className="h-3 w-3" />
                </button>
                <span className="text-[22px]">{d.emoji}</span>
                <h3 className="font-display mt-2 text-[16.5px] font-semibold tracking-[-0.01em]">{d.name}</h3>
                <span className="text-[11.5px] text-silk-faint">
                  {available.length} of {total || "—"} in range
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-[22px] pb-1.5 pt-0.5">
        <IntensityRibbon label="Intensity ceiling" value={store.sharedTier} onChange={store.setSharedTier} />
      </div>
    </div>
  );
}
