import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useLaceStore } from "@/store/useLaceStore";
import { toast } from "@/lib/toast";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartedOver: () => void;
}

export function SettingsSheet({ open, onOpenChange, onStartedOver }: SettingsSheetProps) {
  const resetAll = useLaceStore((s) => s.resetAll);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby="settings-desc">
        <SheetTitle>Settings</SheetTitle>
        <SheetDescription id="settings-desc">Everything here lives only in this browser.</SheetDescription>

        <ClearFiltersRow onDone={() => onOpenChange(false)} />

        <button
          onClick={() => {
            if (!confirm("This clears both profiles and everything from this session. Continue?")) return;
            resetAll();
            onOpenChange(false);
            onStartedOver();
          }}
          className="mb-2 flex w-full items-start gap-3 rounded-ctl border border-stop/30 bg-white/[0.03] px-3.5 py-3.5 text-left transition-colors hover:border-stop/60 hover:bg-stop/[0.08] active:scale-[0.985]"
        >
          <span className="mt-1.5 h-[9px] w-[9px] flex-none rounded-full bg-stop" />
          <span>
            <span className="block text-[14.5px] font-medium text-silk">Start over</span>
            <span className="mt-0.5 block text-xs leading-snug text-silk-faint">
              Clears both profiles and this session. Can&apos;t be undone.
            </span>
          </span>
        </button>

        <SheetClose asChild>
          <Button variant="link" className="mt-1 w-full py-3">
            Close
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}

function ClearFiltersRow({ onDone }: { onDone: () => void }) {
  return (
    <button
      onClick={() => {
        useLaceStore.setState({ sessionSkip: [], extraHardTags: [] });
        toast("Session skips cleared");
        onDone();
      }}
      className="mb-2 flex w-full items-start gap-3 rounded-ctl border border-hairline bg-white/[0.03] px-3.5 py-3.5 text-left transition-colors hover:border-white/25 active:scale-[0.985]"
    >
      <span className="mt-1.5 h-[9px] w-[9px] flex-none rounded-full bg-silk-faint" />
      <span>
        <span className="block text-[14.5px] font-medium text-silk">Clear session skips</span>
        <span className="mt-0.5 block text-xs leading-snug text-silk-faint">
          Un-hide cards you passed with &quot;not tonight&quot; or &quot;not ever.&quot;
        </span>
      </span>
    </button>
  );
}
