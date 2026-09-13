"use client";

interface ConsentToggleProps {
  partnerName: string;
  consented: boolean;
  onChange: (consented: boolean) => void;
}

export default function ConsentToggle({ partnerName, consented, onChange }: ConsentToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container border border-outline-variant/20">
      <span className="font-headline font-bold text-on-surface">{partnerName}</span>
      <button
        onClick={() => onChange(!consented)}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          consented ? "bg-secondary" : "bg-surface-container-high"
        }`}
        role="switch"
        aria-checked={consented}
        aria-label={`Consent toggle for ${partnerName}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-on-surface transition-transform ${
            consented ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}
