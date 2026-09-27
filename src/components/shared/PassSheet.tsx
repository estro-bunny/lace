import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { PassReason } from "@/store/useLaceStore";

interface PassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoose: (reason: PassReason | null) => void;
}

const OPTIONS: { reason: PassReason; title: string; desc: string }[] = [
  { reason: "tonight", title: "Not tonight", desc: "Stays in the deck. Won't come up again this session." },
  { reason: "never", title: "Not ever", desc: "Adds its tags to your hard limits. Filtered out for good, on this device." },
  { reason: "softer", title: "Too much, go softer", desc: "Drops intensity one step." },
];

export function PassSheet({ open, onOpenChange, onChoose }: PassSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby="pass-desc">
        <SheetTitle>Passed.</SheetTitle>
        <SheetDescription id="pass-desc">
          Optional — tell the deck why and it&apos;ll adjust. Skipping this is completely fine.
        </SheetDescription>
        {OPTIONS.map((o) => (
          <button
            key={o.reason}
            onClick={() => onChoose(o.reason)}
            className="mb-2 flex w-full items-start gap-3 rounded-ctl border border-hairline bg-white/[0.03] px-3.5 py-3.5 text-left transition-colors hover:border-white/25 active:scale-[0.985]"
          >
            <span className="mt-1.5 h-[9px] w-[9px] flex-none rounded-full bg-silk-faint" />
            <span>
              <span className="block text-[14.5px] font-medium text-silk">{o.title}</span>
              <span className="mt-0.5 block text-xs leading-snug text-silk-faint">{o.desc}</span>
            </span>
          </button>
        ))}
        <SheetClose asChild>
          <Button variant="link" className="mt-1 w-full py-3" onClick={() => onChoose(null)}>
            Just move on
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
