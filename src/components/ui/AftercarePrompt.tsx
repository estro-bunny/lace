"use client";

import { useState } from "react";

interface AftercarePromptProps {
  prompts: string[];
  onComplete: () => void;
}

export default function AftercarePrompt({ prompts, onComplete }: AftercarePromptProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    if (currentIndex < prompts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-8 text-center animate-fade-in">
        <div className="space-y-4">
          <span className="text-sm font-bold uppercase tracking-widest text-secondary">
            Aftercare
          </span>
          <p className="text-3xl md:text-4xl font-headline font-bold text-on-surface leading-snug">
            {prompts[currentIndex]}
          </p>
          <p className="text-on-surface-variant">
            {currentIndex + 1} of {prompts.length}
          </p>
        </div>

        <button
          onClick={next}
          className="px-8 py-4 rounded-xl bg-secondary text-on-secondary font-bold text-lg hover:opacity-90 transition-opacity"
        >
          {currentIndex < prompts.length - 1 ? "Next" : "Done"}
        </button>
      </div>
    </div>
  );
}
