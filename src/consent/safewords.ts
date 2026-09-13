import type { Safeword } from "@/types/relationship";

const DEFAULT_SAFEWORDS: Safeword[] = [
  { word: "yellow", level: "slow-down" },
  { word: "red", level: "stop" },
  { word: "mercury", level: "emergency" },
];

export function getDefaultSafewords(): Safeword[] {
  return DEFAULT_SAFEWORDS;
}

export function detectSafeword(input: string, safewords: Safeword[]): Safeword | null {
  const normalized = input.trim().toLowerCase();
  return safewords.find((sw) => sw.word.toLowerCase() === normalized) ?? null;
}

export function getSafewordResponse(level: Safeword["level"]): {
  message: string;
  action: "pause" | "stop" | "emergency";
  aftercareRequired: boolean;
} {
  switch (level) {
    case "slow-down":
      return {
        message: "Slowing down. Take a breath. You're in control.",
        action: "pause",
        aftercareRequired: false,
      };
    case "stop":
      return {
        message: "Stopping now. You're safe. I'm here.",
        action: "stop",
        aftercareRequired: true,
      };
    case "emergency":
      return {
        message: "Emergency stop. All activity ceases immediately. Aftercare now.",
        action: "emergency",
        aftercareRequired: true,
      };
  }
}
