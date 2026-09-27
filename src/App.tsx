import { useState } from "react";
import { LaceBackground } from "@/components/shared/LaceBackground";
import { TopBar } from "@/components/shared/TopBar";
import { Toaster } from "@/components/shared/Toaster";
import { SettingsSheet } from "@/components/shared/SettingsSheet";
import { PrintableDeck } from "@/components/shared/PrintableDeck";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { DecksScreen } from "@/components/screens/DecksScreen";
import { GameScreen } from "@/components/screens/GameScreen";
import { RitualFlow } from "@/components/ritual/RitualFlow";
import { useLaceStore } from "@/store/useLaceStore";
import { useBlockPinchZoom } from "@/lib/useBlockPinchZoom";
import type { AppScreen, DeckId } from "@/lib/types";

export default function App() {
  useBlockPinchZoom();
  const profiles = useLaceStore((s) => s.profiles);
  const openDeckAction = useLaceStore((s) => s.openDeck);

  const [screen, setScreen] = useState<AppScreen>(profiles.length < 2 ? "onboard" : "home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeDeck, setActiveDeck] = useState<DeckId | null>(null);
  const [printDeck, setPrintDeck] = useState<DeckId | null>(null);

  function goHome() {
    setScreen(useLaceStore.getState().profiles.length < 2 ? "onboard" : "home");
  }

  function openDeck(id: DeckId) {
    openDeckAction(id);
    setActiveDeck(id);
    setScreen("game");
  }

  return (
    <>
      <div className="no-print relative isolate mx-auto flex min-h-[100svh] w-full max-w-md flex-col overflow-hidden bg-ink">
        <LaceBackground />
        <TopBar onHome={goHome} onSettings={() => setSettingsOpen(true)} />

        <main className="relative z-10 flex flex-1 flex-col">
          {screen === "onboard" && (
            <OnboardingScreen onDone={() => setScreen("home")} />
          )}

          {screen === "home" && (
            <HomeScreen
              onRitual={() => setScreen("ritual")}
              onDecks={() => setScreen("decks")}
              onEditProfiles={() => {
                useLaceStore.setState({ profiles: [] });
                setScreen("onboard");
              }}
            />
          )}

          {screen === "ritual" && (
            <RitualFlow onComplete={() => setScreen("decks")} onSkip={() => setScreen("decks")} />
          )}

          {screen === "decks" && <DecksScreen onOpenDeck={openDeck} onPrintDeck={setPrintDeck} />}

          {screen === "game" && activeDeck && (
            <GameScreen deckId={activeDeck} onBackToDecks={() => setScreen("decks")} />
          )}
        </main>

        <Toaster />
        <SettingsSheet
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onStartedOver={() => setScreen("onboard")}
        />
      </div>

      <PrintableDeck deckId={printDeck} onDone={() => setPrintDeck(null)} />
    </>
  );
}
