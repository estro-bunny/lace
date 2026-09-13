import type { PartnerProfile } from "@/types/profile";

interface PronounSet {
  subject: string;
  object: string;
  possessive: string;
}

const PRONOUN_MAP: Record<string, PronounSet> = {
  "she/her": { subject: "she", object: "her", possessive: "her" },
  "he/him": { subject: "he", object: "him", possessive: "his" },
  "they/them": { subject: "they", object: "them", possessive: "their" },
  "ze/zir": { subject: "ze", object: "zir", possessive: "zir" },
  "xe/xem": { subject: "xe", object: "xem", possessive: "xyr" },
};

export function resolvePronouns(template: string, profiles: PartnerProfile[]): string {
  let result = template;

  for (let i = 0; i < profiles.length; i++) {
    const namePlaceholder = `{name${i + 1}}`;
    const pronounSet = PRONOUN_MAP[profiles[i].pronouns.toLowerCase()];

    result = result.replaceAll(namePlaceholder, profiles[i].name);

    if (pronounSet) {
      result = result.replaceAll(`{partner${i + 1}_subject}`, pronounSet.subject);
      result = result.replaceAll(`{partner${i + 1}_object}`, pronounSet.object);
      result = result.replaceAll(`{partner${i + 1}_possessive}`, pronounSet.possessive);
    }

    result = result.replaceAll(`{partner${i + 1}}`, profiles[i].name);
  }

  return result;
}

export function renderCardText(text: string, profiles: PartnerProfile[]): string {
  return resolvePronouns(text, profiles);
}
