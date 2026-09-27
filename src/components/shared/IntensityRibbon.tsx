import { Slider } from "@/components/ui/slider";
import { TIERS, type Tier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface IntensityRibbonProps {
  value: Tier;
  onChange: (t: Tier) => void;
  label?: string;
  className?: string;
}

export function IntensityRibbon({ value, onChange, label = "Intensity", className }: IntensityRibbonProps) {
  const name = TIERS[value];
  return (
    <div className={cn("px-1", className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11.5px] text-silk-faint">{label}</span>
        <span className="font-display text-[15.5px] font-medium text-accent transition-accent">
          {name[0].toUpperCase() + name.slice(1)}
        </span>
      </div>
      <Slider
        min={0}
        max={3}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v as Tier)}
        aria-label={label}
      />
      <div className="mt-1 flex justify-between text-[10px] text-silk-faint">
        {TIERS.map((t, i) => (
          <span key={t} className={cn(i === value && "font-medium text-silk")}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
