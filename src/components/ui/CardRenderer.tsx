import type { DeckCard } from "@/types/deck";

interface CardRendererProps {
  card: DeckCard;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  question: "Question",
  action: "Action",
  challenge: "Challenge",
  permission: "Permission",
  aftercare: "Aftercare",
};

const categoryIcons: Record<string, string> = {
  question: "❓",
  action: "🔥",
  challenge: "⚡",
  permission: "🔓",
  aftercare: "💜",
};

const intensityStyles: Record<string, string> = {
  gentle: "bg-secondary/20 text-secondary border-secondary/30",
  moderate: "bg-primary/20 text-primary border-primary/30",
  steamy: "bg-primary-container/20 text-primary-container border-primary-container/30",
  intense: "bg-error/20 text-error border-error/30",
};

export default function CardRenderer({ card, className = "" }: CardRendererProps) {
  return (
    <div className={`card-enter relative max-w-lg mx-auto ${className}`}>
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-primary-container/20 blur-sm opacity-60" />
      <div className="relative glass-card rounded-2xl border border-outline-variant/20 p-8 space-y-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/8 to-transparent rounded-tr-full" />

        <div className="flex items-center gap-3 relative z-10">
          <span className="text-lg">{categoryIcons[card.category] || "✨"}</span>
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${intensityStyles[card.intensity]}`}>
            {card.intensity}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {categoryLabels[card.category]}
          </span>
        </div>

        <p className="text-2xl md:text-3xl font-headline font-bold text-on-surface leading-snug relative z-10">
          {card.text}
        </p>

        <div className="flex flex-wrap gap-2 pt-2 relative z-10">
          {card.tags.map((tag, i) => (
            <span
              key={tag}
              className={`text-xs bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full border border-outline-variant/10 hover:border-primary/30 hover:text-primary transition-colors duration-200 stagger-${Math.min(i + 1, 5)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
