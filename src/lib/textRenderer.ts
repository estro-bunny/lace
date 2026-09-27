import type { Profile, Pronouns } from "./types";

const PRONOUN_MAP: Record<Pronouns, { subject: string; object: string; possessive: string }> = {
  "she/her": { subject: "she", object: "her", possessive: "her" },
  "he/him": { subject: "he", object: "him", possessive: "his" },
  "they/them": { subject: "they", object: "them", possessive: "their" },
  "ze/zir": { subject: "ze", object: "zir", possessive: "zir" },
  "xe/xem": { subject: "xe", object: "xem", possessive: "xyr" },
};

/**
 * Resolves {name1}, {partner1}, {partner1_subject|object|possessive}
 * (and the _2 equivalents) against two profiles. p1 is whoever the card
 * currently addresses — the active/receiving partner for this turn.
 */
export function renderCardText(text: string, p1?: Profile, p2?: Profile): string {
  let out = text;
  [p1, p2].forEach((p, idx) => {
    if (!p) return;
    const n = idx + 1;
    const pronouns = PRONOUN_MAP[p.pronouns];
    out = out.replaceAll(`{name${n}}`, p.name);
    out = out.replaceAll(`{partner${n}}`, p.name);
    if (pronouns) {
      out = out.replaceAll(`{partner${n}_subject}`, pronouns.subject);
      out = out.replaceAll(`{partner${n}_object}`, pronouns.object);
      out = out.replaceAll(`{partner${n}_possessive}`, pronouns.possessive);
    }
  });
  return out;
}

/** Splits a "Would you rather X or Y?" card into its two options. */
export function parseWouldYouRather(text: string): [string, string] {
  const m = text.match(/^Would you rather (.+?) or (.+?)\??$/i);
  if (!m) return [text, ""];
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return [cap(m[1]), cap(m[2])];
}
