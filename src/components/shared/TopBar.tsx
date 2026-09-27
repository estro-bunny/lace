import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onHome: () => void;
  onSettings: () => void;
}

export function TopBar({ onHome, onSettings }: TopBarProps) {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 pb-2 pt-[calc(env(safe-area-inset-top)+16px)]">
      <button
        onClick={onHome}
        className="flex items-center gap-2 font-display text-[23px] font-semibold tracking-[-0.022em] text-silk"
        aria-label="Home"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" className="h-[17px] w-[17px]">
          <path d="M12 2C17 6 17 10 12 12C7 14 7 18 12 22" className="stroke-accent transition-accent" />
          <path d="M12 2C7 6 7 10 12 12C17 14 17 18 12 22" className="stroke-accent transition-accent" />
        </svg>
        Lace
      </button>
      <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
        <Settings className="h-[15px] w-[15px]" />
      </Button>
    </header>
  );
}
