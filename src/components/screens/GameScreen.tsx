import { useEffect, useState } from "react";
import { ArrowLeft, Undo2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntensityRibbon } from "@/components/shared/IntensityRibbon";
import { SafewordSheet, type SafewordLevel } from "@/components/shared/SafewordSheet";
import { PassSheet } from "@/components/shared/PassSheet";
import { GameErrorBoundary } from "@/components/shared/GameErrorBoundary";
import { useLaceStore, type PassReason } from "@/store/useLaceStore";
import { useAccent } from "@/lib/useAccent";
import { DECK_META } from "@/lib/decks";
import { toast } from "@/lib/toast";
import type { Card, DeckId } from "@/lib/types";

import { TruthOrDare } from "@/components/games/TruthOrDare";
import { WouldYouRather } from "@/components/games/WouldYouRather";
import { SexyDice } from "@/components/games/SexyDice";
import { ForeplayRoulette } from "@/components/games/ForeplayRoulette";
import { AftercareFlow } from "@/components/screens/AftercareFlow";

interface GameScreenProps {
  deckId: DeckId;
  onBackToDecks: () => void;
}

/** Shape every game engine passes up so the shell can offer Pass and Undo consistently. */
export interface GameApi {
  registerUndo: (fn: (() => void) | null) => void;
  requestPass: (card: Card) => void;
}

export function GameScreen({ deckId, onBackToDecks }: GameScreenProps) {
  const store = useLaceStore();
  useAccent(store.sharedTier);

  const meta = DECK_META.find((d) => d.id === deckId)!;
  const activePartner = store.profiles[store.turn];

  const [safeOpen, setSafeOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [pendingPass, setPendingPass] = useState<Card | null>(null);
  const [undoFn, setUndoFn] = useState<(() => void) | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (store.mode !== "play") return;
    if (store.dealt > 0 && store.dealt % 7 === 0) {
      setBanner("You've been at this a while. Cooling down is always available — no judgment, just options.");
    }
  }, [store.dealt, store.mode]);

  const api: GameApi = {
    registerUndo: setUndoFn,
    requestPass: (card) => {
      setPendingPass(card);
      setPassOpen(true);
    },
  };

  function handlePassChoice(reason: PassReason | null) {
    if (pendingPass && reason) {
      store.applyPass(pendingPass, reason);
      toast(
        reason === "never"
          ? `Filtered for good: ${pendingPass.tags.join(", ")}. The deck got the memo.`
          : reason === "tonight"
            ? "Skipped for tonight. Won't come up again this session."
            : "Eased down a notch. Soft chaos only from here.",
      );
    }
    setPendingPass(null);
    setPassOpen(false);
  }

  function handleSafeword(level: SafewordLevel) {
    setSafeOpen(false);
    if (navigator.vibrate) navigator.vibrate([16, 60, 16]);
    if (level === "slow") {
      store.setSharedTier(Math.max(0, store.sharedTier - 1) as typeof store.sharedTier);
      setBanner("Held lower. Take as long as you want — the deck can wait.");
    } else if (level === "stop") {
      store.enterAftercare();
      setBanner("Stopped. Nothing else is coming unless you ask for it.");
    } else {
      store.enterAftercare();
      toast("Screen cleared. Breathe.");
    }
  }

  const isAftercare = store.mode === "aftercare";

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-5 pt-0.5">
        <button onClick={onBackToDecks} className="flex items-center gap-1 py-1 text-xs text-silk-faint hover:text-silk">
          <ArrowLeft className="h-3.5 w-3.5" />
          Decks
        </button>
        <div className="flex items-center gap-3">
          {undoFn && !isAftercare && (
            <button
              onClick={() => {
                undoFn();
                setUndoFn(null);
                toast("Undone. A few seconds of mercy, no questions asked.");
              }}
              className="flex items-center gap-1 text-xs text-silk-faint hover:text-silk"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </button>
          )}
          {!isAftercare && (
            <div className="flex items-center gap-1.5 text-xs text-silk-faint">
              <span className="h-[5px] w-[5px] rounded-full bg-accent transition-accent" />
              for <b className="font-medium text-silk">{activePartner?.name ?? "—"}</b>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-1.5 text-center font-display text-[20px] font-medium tracking-[-0.015em]">
        {isAftercare ? "Aftercare" : meta.name}
      </div>

      {banner && (
        <div className="mx-5 mt-2 flex items-center gap-2 rounded-[14px] border border-powder/30 bg-powder/[0.08] px-3.5 py-2.5 text-[12.5px] leading-snug text-[#CFE4FF]">
          <Heart className="h-3.5 w-3.5 flex-none opacity-85" />
          <span>{banner}</span>
          <button onClick={() => setBanner(null)} className="ml-auto text-base leading-none opacity-60 hover:opacity-100">
            ×
          </button>
        </div>
      )}

      <div className="relative flex flex-1 flex-col">
        {isAftercare ? (
          <AftercareFlow
            onFinished={() => {
              store.exitAftercare();
              setBanner(null);
              onBackToDecks();
              toast("Back whenever you're ready. Chaos on pause.");
            }}
          />
        ) : (
          <GameErrorBoundary resetKey={deckId} onReset={onBackToDecks}>
            {meta.game === "tod" ? (
              <TruthOrDare deckId={deckId} api={api} />
            ) : meta.game === "wyr" ? (
              <WouldYouRather deckId={deckId} api={api} />
            ) : meta.game === "dice" ? (
              <SexyDice deckId={deckId} api={api} />
            ) : (
              <ForeplayRoulette deckId={deckId} api={api} />
            )}
          </GameErrorBoundary>
        )}
      </div>

      {!isAftercare && (
        <div className="px-5 pb-0.5">
          <IntensityRibbon value={store.sharedTier} onChange={store.setSharedTier} />
        </div>
      )}

      {!isAftercare && (
        <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-2.5">
          <Button
            variant="ghost"
            onClick={() => setSafeOpen(true)}
            className="w-full !border-dashed !border-amber/30 !text-amber/80 hover:!border-amber/60 hover:!bg-amber/[0.09] hover:!text-amber"
          >
            <ShieldIcon />
            Safeword
          </Button>
        </div>
      )}

      <SafewordSheet open={safeOpen} onOpenChange={setSafeOpen} onChoose={handleSafeword} />
      <PassSheet open={passOpen} onOpenChange={setPassOpen} onChoose={handlePassChoice} />
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px]">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}
