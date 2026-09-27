import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export type SafewordLevel = "slow" | "stop" | "mercury";

interface SafewordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoose: (level: SafewordLevel) => void;
}

const OPTIONS: { level: SafewordLevel; title: string; desc: string; tone: "amber" | "stop" }[] = [
  {
    level: "slow",
    title: "Yellow — slow down",
    desc: "Drops intensity a step and holds. Pick back up whenever.",
    tone: "amber",
  },
  {
    level: "stop",
    title: "Red — stop",
    desc: "Ends the round and moves into aftercare.",
    tone: "stop",
  },
  {
    level: "mercury",
    title: "Mercury — full stop",
    desc: "Closes the deck and clears the screen right away.",
    tone: "stop",
  },
];

export function SafewordSheet({ open, onOpenChange, onChoose }: SafewordSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby="safeword-desc">
        <SheetTitle>Which one?</SheetTitle>
        <SheetDescription id="safeword-desc">
          Nothing is written to either profile. Whatever you pick, the deck stops dealing.
        </SheetDescription>
        {OPTIONS.map((o) => (
          <button
            key={o.level}
            onClick={() => onChoose(o.level)}
            className={`mb-2 flex w-full items-start gap-3 rounded-ctl border px-3.5 py-3.5 text-left transition-colors active:scale-[0.985] ${
              o.tone === "amber"
                ? "border-amber/30 bg-white/[0.03] hover:border-amber/60 hover:bg-amber/[0.08]"
                : "border-stop/30 bg-white/[0.03] hover:border-stop/60 hover:bg-stop/[0.08]"
            }`}
          >
            <span
              className={`mt-1.5 h-[9px] w-[9px] flex-none rounded-full ${
                o.tone === "amber" ? "bg-amber" : "bg-stop"
              }`}
            />
            <span>
              <span className="block text-[14.5px] font-medium text-silk">{o.title}</span>
              <span className="mt-0.5 block text-xs leading-snug text-silk-faint">{o.desc}</span>
            </span>
          </button>
        ))}
        <SheetClose asChild>
          <Button variant="link" className="mt-1 w-full py-3">
            Back to the game
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
