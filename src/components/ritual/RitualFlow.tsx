import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerticalGauge } from "@/components/ritual/VerticalGauge";
import { HoldButton } from "@/components/ritual/HoldButton";
import { RopePull } from "@/components/ritual/RopePull";
import { useLaceStore } from "@/store/useLaceStore";
import { useAccent } from "@/lib/useAccent";
import type { Tier } from "@/lib/types";

type Step = "private" | "shield" | "reveal" | "rope";

interface RitualFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function RitualFlow({ onComplete, onSkip }: RitualFlowProps) {
  const profiles = useLaceStore((s) => s.profiles);
  const setSharedTier = useLaceStore((s) => s.setSharedTier);

  const [step, setStep] = useState<Step>("private");
  const [who, setWho] = useState<0 | 1>(0);
  const [gauge, setGauge] = useState(1.3);
  const [priv, setPriv] = useState<[number | null, number | null]>([null, null]);

  const baseline = priv[0] != null && priv[1] != null ? Math.min(priv[0], priv[1]) : 1;
  const higher = priv[0] != null && priv[1] != null ? Math.max(priv[0], priv[1]) : 1;

  useAccent(step === "rope" ? baseline : gauge);

  const stepIndex = { private: 0, shield: 0, reveal: 1, rope: 2 }[step];

  function lockPrivate() {
    const next: [number | null, number | null] = [...priv] as [number | null, number | null];
    next[who] = gauge;
    setPriv(next);
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    if (who === 0) {
      setStep("shield");
    } else {
      setStep("reveal");
    }
  }

  const gap = higher - baseline;
  const gapCopy =
    gap < 0.5
      ? { head: "Close enough", body: "You're both around the same place tonight.", line: "barely a gap" }
      : gap < 1.3
        ? { head: "A bit of a gap", body: "One of you is further along than the other tonight. That's completely normal.", line: "a noticeable gap" }
        : { head: "Pretty different tonight", body: "You're starting from different places. The deck will lean gentle and let you build from there — together.", line: "a real gap" };

  if (profiles.length < 2) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center text-sm text-silk-faint">
        Both profiles need to exist before the ritual can run.
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="flex justify-center gap-1.5 px-5 pt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-[3px] rounded-full transition-all ${
              i === stepIndex ? "w-[26px] bg-accent" : i < stepIndex ? "w-4 bg-silk-dim" : "w-4 bg-white/[0.14]"
            }`}
          />
        ))}
      </div>

      {(step === "private" || step === "shield") && (
        <div className="flex flex-1 flex-col justify-center gap-[22px] px-[28px] pb-10 pt-2">
          <div className="text-center">
            <div className="font-display text-[25px] font-medium tracking-[-0.018em]">{profiles[who].name}</div>
            <div className="mt-1.5 text-[13px] leading-normal text-silk-faint">
              How much do you want, tonight — just for you to see.
            </div>
          </div>
          <VerticalGauge value={gauge} onChange={setGauge} />
          <Button onClick={lockPrivate}>Lock it in</Button>
          <button onClick={onSkip} className="text-[12.5px] text-silk-faint underline decoration-white/10 underline-offset-4 hover:text-silk">
            Skip the ritual
          </button>
        </div>
      )}

      {step === "shield" && (
        <div className="absolute inset-0 z-[9] flex flex-col items-center justify-center gap-[22px] bg-ink px-7 text-center">
          <div className="grid h-[52px] w-[52px] place-items-center rounded-full border border-dashed border-[var(--thread-lit)] text-accent">
            <Eye className="h-[22px] w-[22px]" />
          </div>
          <h2 className="font-display text-[22px] font-medium tracking-[-0.018em]">Hand it to {profiles[1].name}</h2>
          <p className="max-w-[260px] text-[13px] leading-relaxed text-silk-faint">
            Look away while they answer. Their number is theirs to keep.
          </p>
          <HoldButton
            label="Hold — I'm ready"
            onConfirm={() => {
              setWho(1);
              setGauge(1.3);
              setStep("private");
            }}
          />
        </div>
      )}

      {step === "reveal" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-[28px] pb-10 pt-2 text-center">
          <svg viewBox="0 0 280 80" className="h-[74px] w-full max-w-[260px]">
            <path
              d={`M0 ${(40 - (8 + gap * 9)).toFixed(1)} Q140 ${(40 - (8 + gap * 9)).toFixed(1)} 280 40`}
              fill="none"
              stroke="var(--rose)"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <path
              d={`M0 ${(40 + (8 + gap * 9)).toFixed(1)} Q140 ${(40 + (8 + gap * 9)).toFixed(1)} 280 40`}
              fill="none"
              stroke="var(--powder)"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          </svg>
          <h1 className="font-display text-[29px] font-medium tracking-[-0.02em]">{gapCopy.head}</h1>
          <p className="text-[13.5px] leading-relaxed text-silk-faint">{gapCopy.body}</p>
          <p className="text-[13px] text-silk-dim">You never see each other's number — only this: {gapCopy.line}.</p>
          <Button className="w-full" onClick={() => setStep("rope")}>
            Set the tension together
          </Button>
        </div>
      )}

      {step === "rope" && (
        <RopePull
          nameA={profiles[0].name}
          nameB={profiles[1].name}
          baseline={baseline}
          higher={higher}
          onConfirmed={(merged) => {
            setSharedTier(Math.round(merged) as Tier);
            onComplete();
          }}
        />
      )}
    </div>
  );
}
