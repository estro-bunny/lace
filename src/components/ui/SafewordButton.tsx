"use client";

import { useState } from "react";
import { useSessionStore } from "@/sessions/session-store";
import { getSafewordResponse } from "@/consent/safewords";

export default function SafewordButton() {
  const { session, triggerSafeword } = useSessionStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSafeword = (level: "slow-down" | "stop" | "emergency") => {
    triggerSafeword(level);
    const res = getSafewordResponse(level);
    setResponse(res.message);
    setShowConfirm(false);
  };

  if (response) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-error-container text-on-error-container px-6 py-4 rounded-2xl shadow-2xl max-w-sm animate-fade-in-up border border-error/30">
        <p className="font-headline font-bold text-lg">{response}</p>
        <button
          onClick={() => setResponse(null)}
          className="mt-2 text-sm underline opacity-80 hover:opacity-100 transition-opacity"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-surface-container-high border border-outline-variant/40 rounded-2xl shadow-2xl p-4 space-y-2 animate-fade-in-up backdrop-blur-xl">
        <p className="text-sm text-on-surface-variant font-bold uppercase tracking-wider">
          Safeword
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleSafeword("slow-down")}
            className="px-4 py-2 rounded-xl bg-secondary/20 text-secondary font-bold hover:bg-secondary/30 transition-all duration-200 text-left border border-secondary/20 hover:border-secondary/40"
          >
            Yellow — Slow down
          </button>
          <button
            onClick={() => handleSafeword("stop")}
            className="px-4 py-2 rounded-xl bg-error/20 text-error font-bold hover:bg-error/30 transition-all duration-200 text-left border border-error/20 hover:border-error/40"
          >
            Red — Stop
          </button>
          <button
            onClick={() => handleSafeword("emergency")}
            className="px-4 py-2 rounded-xl bg-error text-on-error font-bold hover:opacity-90 transition-opacity text-left shadow-lg shadow-error/20"
          >
            Mercury — Emergency stop
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 rounded-xl text-on-surface-variant text-sm hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-error to-error-container text-on-error w-14 h-14 rounded-full shadow-2xl shadow-error/30 flex items-center justify-center hover:scale-110 transition-all duration-300 animate-safeword-pulse"
      aria-label="Open safeword menu"
    >
      <span className="material-symbols-outlined text-2xl">shield</span>
    </button>
  );
}
