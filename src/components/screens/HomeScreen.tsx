import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLaceStore } from "@/store/useLaceStore";
import { TIERS, type Tier } from "@/lib/types";

interface HomeScreenProps {
  onRitual: () => void;
  onDecks: () => void;
  onEditProfiles: () => void;
}

export function HomeScreen({ onRitual, onDecks, onEditProfiles }: HomeScreenProps) {
  const profiles = useLaceStore((s) => s.profiles);
  const setCeiling = useLaceStore((s) => s.setCeiling);
  const houseRule = useLaceStore((s) => s.houseRule);
  const setHouseRule = useLaceStore((s) => s.setHouseRule);
  const [editingRule, setEditingRule] = useState(false);
  const [draft, setDraft] = useState(houseRule);
  const [editingCeilingFor, setEditingCeilingFor] = useState<number | null>(null);

  return (
    <div className="flex flex-1 flex-col justify-center gap-5 px-[26px] pb-[calc(env(safe-area-inset-bottom)+26px)] pt-2 text-center">
      <div>
        <h1 className="font-display text-[29px] font-medium tracking-[-0.02em]">Ready when you are</h1>
        <p className="text-[14px] leading-relaxed text-silk-faint">
          queer couple games, filtered through what you're both actually okay with. chaos optional. consent not.
        </p>
      </div>

      <Card className="flex flex-col gap-2.5 text-left">
        {profiles.map((p, i) => (
          <div key={p.id} className={i > 0 ? "border-t border-hairline pt-2.5" : ""}>
            <div className="flex items-center justify-between text-[14.5px]">
              <span className="font-display font-semibold">{p.name}</span>
              <span className="text-xs text-silk-faint">{p.pronouns}</span>
            </div>
            {p.hardLimits.length > 0 && (
              <div className="mt-1 text-[11px] text-silk-faint">
                hard limits: <b className="font-medium text-stop">{p.hardLimits.join(", ")}</b>
              </div>
            )}

            {editingCeilingFor === i ? (
              <div className="mt-1.5 flex gap-1">
                {TIERS.map((t, tIdx) => (
                  <button
                    key={t}
                    onClick={() => {
                      setCeiling(i as 0 | 1, tIdx as Tier);
                      setEditingCeilingFor(null);
                    }}
                    className={`flex-1 rounded-full border px-1.5 py-1.5 text-[11px] capitalize transition-colors ${
                      p.ceiling === tIdx
                        ? "border-transparent bg-accent font-semibold text-[#1A0710] transition-accent"
                        : "border-hairline bg-white/[0.03] text-silk-dim hover:border-white/25 hover:text-silk"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setEditingCeilingFor(i)}
                className="mt-0.5 text-[11px] text-silk-faint hover:text-silk"
              >
                personal ceiling:{" "}
                <b className="font-medium text-silk-dim underline decoration-white/10 underline-offset-2">
                  {TIERS[p.ceiling]}
                </b>
              </button>
            )}
          </div>
        ))}
      </Card>

      <div className="text-left">
        {editingRule ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              setHouseRule(draft.trim());
              setEditingRule(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            placeholder="e.g. we're playing to have fun, not to perform"
            maxLength={80}
            className="w-full rounded-[12px] border border-hairline bg-white/[0.04] px-3 py-2.5 text-[13px] text-silk outline-none placeholder:text-silk-faint focus:border-white/30"
          />
        ) : (
          <button
            onClick={() => {
              setDraft(houseRule);
              setEditingRule(true);
            }}
            className="flex w-full items-center gap-1.5 text-[12px] text-silk-faint hover:text-silk"
          >
            <Pencil className="h-3 w-3 flex-none" />
            {houseRule ? `House rule: "${houseRule}"` : "Add a house rule for tonight (optional, but cute)"}
          </button>
        )}
      </div>

      <Button onClick={onRitual} disabled={profiles.length < 2}>
        Set tonight's tension
      </Button>
      <Button variant="outline" onClick={onDecks}>
        Skip the ritual, go wild
      </Button>
      <button
        onClick={onEditProfiles}
        className="text-[12.5px] text-silk-faint underline decoration-white/10 underline-offset-4 hover:text-silk"
      >
        Edit profiles
      </button>
    </div>
  );
}
