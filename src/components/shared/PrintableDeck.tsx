import { useEffect } from "react";
import { DECK_META } from "@/lib/decks";
import { eligiblePool } from "@/lib/consent";
import { renderCardText } from "@/lib/textRenderer";
import { useLaceStore } from "@/store/useLaceStore";
import type { DeckId } from "@/lib/types";

interface PrintableDeckProps {
  deckId: DeckId | null;
  onDone: () => void;
}

/**
 * Mounted once at the app root. When `deckId` is set, renders the eligible
 * pool as a print sheet (hidden on screen, shown via @media print in
 * index.css) and fires window.print(). Resets itself via the
 * `afterprint` event so the same flow works whether the person prints or
 * cancels the dialog.
 */
export function PrintableDeck({ deckId, onDone }: PrintableDeckProps) {
  const store = useLaceStore();

  useEffect(() => {
    if (!deckId) return;
    const handle = () => onDone();
    window.addEventListener("afterprint", handle);
    // Give the sheet a tick to actually paint before invoking the print dialog.
    const t = setTimeout(() => window.print(), 60);
    return () => {
      window.removeEventListener("afterprint", handle);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  if (!deckId) return null;

  const meta = DECK_META.find((d) => d.id === deckId)!;
  const ctx = {
    profiles: store.profiles,
    sharedTier: store.sharedTier,
    extraHardTags: store.extraHardTags,
    sessionSkip: store.sessionSkip,
  };
  const { available } = eligiblePool(deckId, ctx);
  const [p1, p2] = store.profiles;

  return (
    <div className="print-sheet">
      <style>{`
        @page { margin: 14mm; }
        .print-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
        .print-card {
          border: 1px dashed #999;
          border-radius: 4mm;
          padding: 5mm;
          break-inside: avoid;
          font-family: Georgia, serif;
        }
        .print-card h4 { font-family: sans-serif; font-size: 8pt; text-transform: uppercase; letter-spacing: .04em; color: #666; margin: 0 0 2mm; }
        .print-card p { font-size: 11pt; line-height: 1.4; margin: 0; }
      `}</style>
      <h1 style={{ fontFamily: "sans-serif", fontSize: "16pt", marginBottom: "2mm" }}>
        Lace — {meta.name}
      </h1>
      <p style={{ fontFamily: "sans-serif", fontSize: "9pt", color: "#666", marginBottom: "6mm" }}>
        {available.length} cards, filtered to what {p1?.name ?? "you"} and {p2?.name ?? "your partner"} are both okay
        with, at the intensity ceiling set when this was printed. Cut along the dashed borders.
      </p>
      <div className="print-card-grid">
        {available.map((c) => (
          <div key={c.id} className="print-card">
            <h4>
              {c.intensity} · {c.category}
            </h4>
            <p>{renderCardText(c.text, p1, p2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
