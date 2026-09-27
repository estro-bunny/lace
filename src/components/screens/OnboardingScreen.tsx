import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useLaceStore } from "@/store/useLaceStore";
import { toast } from "@/lib/toast";
import type { Pronouns, Tier } from "@/lib/types";
import { TIERS } from "@/lib/types";

const PRONOUN_OPTIONS: Pronouns[] = ["she/her", "he/him", "they/them", "ze/zir", "xe/xem"];

interface OnboardingScreenProps {
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const profiles = useLaceStore((s) => s.profiles);
  const addProfile = useLaceStore((s) => s.addProfile);
  const step = profiles.length; // 0 or 1

  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState<Pronouns>("they/them");
  const [hard, setHard] = useState("");
  const [soft, setSoft] = useState("");
  const [ceiling, setCeiling] = useState<Tier>(3);

  function reset() {
    setName("");
    setPronouns("they/them");
    setHard("");
    setSoft("");
    setCeiling(3);
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addProfile({
      name: trimmed,
      pronouns,
      hardLimits: hard.split(",").map((s) => s.trim()).filter(Boolean),
      softLimits: soft.split(",").map((s) => s.trim()).filter(Boolean),
      ceiling,
    });
    reset();
    if (step === 1) {
      toast("Both profiles saved");
      onDone();
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-[22px] px-[26px] pb-[calc(env(safe-area-inset-bottom)+26px)] pt-2">
      <div className="flex justify-center gap-1.5">
        {[0, 1].map((i) => (
          <span
            key={i}
            className={`h-[3px] w-[22px] rounded-full transition-colors ${
              i <= step ? "bg-accent" : "bg-white/[0.14]"
            }`}
          />
        ))}
      </div>

      <div className="text-center">
        <h1 className="font-display text-[30px] font-medium tracking-[-0.02em]">
          {step === 0 ? "Create your profile" : "Now your partner's"}
        </h1>
        <p className="mt-1.5 text-[13.5px] leading-normal text-silk-faint">
          {step === 0
            ? "Two profiles, so every card can be filtered through what you're both okay with."
            : "Same deal — this one's just for them."}
        </p>
      </div>

      <Field label="Name">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          maxLength={24}
          placeholder="What should the deck call you?"
          className="w-full rounded-[14px] border border-hairline bg-white/[0.04] px-4 py-3.5 text-base text-silk outline-none transition-colors placeholder:text-silk-faint focus:border-white/30 focus:bg-white/[0.06]"
        />
      </Field>

      <Field label="Pronouns">
        <div className="flex flex-wrap gap-1.5">
          {PRONOUN_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPronouns(p)}
              aria-pressed={pronouns === p}
              className={`rounded-full border px-3.5 py-2 text-[13px] transition-colors ${
                pronouns === p
                  ? "border-transparent bg-accent font-semibold text-[#1A0710] transition-accent"
                  : "border-hairline bg-white/[0.03] text-silk-dim hover:border-white/25 hover:text-silk"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Personal ceiling" hint="On your turn, cards never go above this — even if the shared ribbon is set higher.">
        <div className="flex gap-1.5">
          {TIERS.map((t, i) => (
            <button
              key={t}
              onClick={() => setCeiling(i as Tier)}
              aria-pressed={ceiling === i}
              className={`flex-1 rounded-full border px-2 py-2 text-[12px] capitalize transition-colors ${
                ceiling === i
                  ? "border-transparent bg-accent font-semibold text-[#1A0710] transition-accent"
                  : "border-hairline bg-white/[0.03] text-silk-dim hover:border-white/25 hover:text-silk"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Hard limits" hint="Anything tagged with these is filtered out completely. Comma-separated, optional.">
        <input
          value={hard}
          onChange={(e) => setHard(e.target.value)}
          placeholder="e.g. pain, restraint"
          className="w-full rounded-[14px] border border-hairline bg-white/[0.04] px-4 py-3.5 text-base text-silk outline-none transition-colors placeholder:text-silk-faint focus:border-stop/55 focus:bg-white/[0.06]"
        />
      </Field>

      <Field label="Soft limits" hint="Still shown, just flagged, so you can decide in the moment. Optional.">
        <input
          value={soft}
          onChange={(e) => setSoft(e.target.value)}
          placeholder="e.g. temperature, blindfold"
          className="w-full rounded-[14px] border border-hairline bg-white/[0.04] px-4 py-3.5 text-base text-silk outline-none transition-colors placeholder:text-silk-faint focus:border-amber/50 focus:bg-white/[0.06]"
        />
      </Field>

      <Button onClick={save} disabled={!name.trim()}>
        Save profile
      </Button>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-silk-dim">{label}</label>
      {hint && <span className="-mt-0.5 text-[11.5px] text-silk-faint">{hint}</span>}
      {children}
    </div>
  );
}
