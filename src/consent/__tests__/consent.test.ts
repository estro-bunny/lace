import { evaluateConsent, createInitialConsentState, updateConsent } from "../engine";
import { checkLimits, getCardsWithinLimits } from "../limits";
import type { DeckCard, CardId } from "@/types/deck";
import type { PartnerProfile, ProfileId } from "@/types/profile";
import type { ConsentState } from "@/types/session";

function makeCard(overrides?: Partial<DeckCard>): DeckCard {
  return {
    id: "card-1" as CardId,
    category: "action",
    intensity: "moderate",
    text: "Do something",
    bodyConfigurations: ["any"],
    genderNeutral: true,
    requiresTwo: true,
    aftercare: false,
    tags: ["touch", "kissing"],
    ...overrides,
  };
}

function makeProfile(overrides?: Partial<PartnerProfile>): PartnerProfile {
  return {
    id: "p1" as ProfileId,
    name: "Alex",
    pronouns: "they/them",
    genderIdentity: "nonbinary",
    bodyConfigurations: ["any"],
    hardLimits: [],
    softLimits: [],
    preferences: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("checkLimits", () => {
  const profiles = [makeProfile(), makeProfile({ id: "p2" as ProfileId })];

  it("returns allowed when no limits match", () => {
    const card = makeCard({ id: "card-1" as CardId, tags: ["touch"] });
    expect(checkLimits(card, profiles, [], [])).toBe("allowed");
  });

  it("returns denied when card tag matches shared hard limit", () => {
    const card = makeCard({ id: "card-2" as CardId, tags: ["impact"] });
    expect(checkLimits(card, profiles, ["impact"], [])).toBe("denied");
  });

  it("returns soft-limit when card tag matches shared soft limit", () => {
    const card = makeCard({ id: "card-3" as CardId, tags: ["blindfold"] });
    expect(checkLimits(card, profiles, [], ["blindfold"])).toBe("soft-limit");
  });

  it("returns denied when card tag matches individual hard limit", () => {
    const card = makeCard({ id: "card-4" as CardId, tags: ["choking"] });
    const profilesLimited = [
      makeProfile({ hardLimits: ["choking"] }),
      makeProfile({ id: "p2" as ProfileId }),
    ];
    expect(checkLimits(card, profilesLimited, [], [])).toBe("denied");
  });

  it("returns allowed when tags do not match any limit", () => {
    const card = makeCard({ id: "card-5" as CardId, tags: ["kissing"] });
    const profilesLimited = [makeProfile({ hardLimits: ["impact"] }), makeProfile({ id: "p2" as ProfileId })];
    expect(checkLimits(card, profilesLimited, ["bondage"], ["pain"])).toBe("allowed");
  });

  it("hard limit takes priority over soft limit", () => {
    const card = makeCard({ id: "card-6" as CardId, tags: ["kink"] });
    expect(checkLimits(card, profiles, ["kink"], ["kink"])).toBe("denied");
  });
});

describe("getCardsWithinLimits", () => {
  const profiles = [makeProfile(), makeProfile({ id: "p2" as ProfileId })];

  it("returns all cards when no limits match", () => {
    const cards = [makeCard({ tags: ["touch"] }), makeCard({ id: "card-2" as CardId, tags: ["kissing"] })];
    expect(getCardsWithinLimits(cards, profiles, [], [])).toHaveLength(2);
  });

  it("filters out hard-limited cards", () => {
    const cards = [
      makeCard({ id: "card-1" as CardId, tags: ["touch"] }),
      makeCard({ id: "card-2" as CardId, tags: ["impact"] }),
    ];
    expect(getCardsWithinLimits(cards, profiles, ["impact"], [])).toHaveLength(1);
  });

  it("keeps soft-limited cards", () => {
    const cards = [
      makeCard({ id: "card-1" as CardId, tags: ["blindfold"] }),
      makeCard({ id: "card-2" as CardId, tags: ["touch"] }),
    ];
    expect(getCardsWithinLimits(cards, profiles, [], ["blindfold"])).toHaveLength(2);
  });

  it("returns empty array when all cards are denied", () => {
    const cards = [makeCard({ tags: ["impact"] })];
    expect(getCardsWithinLimits(cards, profiles, ["impact"], [])).toHaveLength(0);
  });
});

describe("evaluateConsent", () => {
  const profiles = [makeProfile(), makeProfile({ id: "p2" as ProfileId })];

  it("returns requires-discussion when explicit consent not given", () => {
    const consent: ConsentState = {
      partnerA: true,
      partnerB: false,
      currentActivity: null,
      explicitConsentGiven: false,
    };
    expect(evaluateConsent(makeCard(), profiles, consent, [], [])).toBe("requires-discussion");
  });

  it("returns allowed when consent given and no limits violated", () => {
    const consent: ConsentState = {
      partnerA: true,
      partnerB: true,
      currentActivity: null,
      explicitConsentGiven: true,
    };
    expect(evaluateConsent(makeCard(), profiles, consent, [], [])).toBe("allowed");
  });

  it("returns denied when hard limit violated", () => {
    const consent: ConsentState = {
      partnerA: true,
      partnerB: true,
      currentActivity: null,
      explicitConsentGiven: true,
    };
    const card = makeCard({ tags: ["impact"] });
    expect(evaluateConsent(card, profiles, consent, ["impact"], [])).toBe("denied");
  });
});

describe("createInitialConsentState", () => {
  it("creates default consent state", () => {
    const state = createInitialConsentState();
    expect(state).toEqual({
      partnerA: false,
      partnerB: false,
      currentActivity: null,
      explicitConsentGiven: false,
    });
  });
});

describe("updateConsent", () => {
  it("sets partnerA consent", () => {
    const initial = createInitialConsentState();
    const updated = updateConsent(initial, "A", true);
    expect(updated.partnerA).toBe(true);
    expect(updated.partnerB).toBe(false);
    expect(updated.explicitConsentGiven).toBe(false);
  });

  it("sets partnerB consent", () => {
    const initial = createInitialConsentState();
    const updated = updateConsent(initial, "B", true);
    expect(updated.partnerA).toBe(false);
    expect(updated.partnerB).toBe(true);
    expect(updated.explicitConsentGiven).toBe(false);
  });

  it("gives explicit consent when both partners consent", () => {
    let state = createInitialConsentState();
    state = updateConsent(state, "A", true);
    state = updateConsent(state, "B", true);
    expect(state.explicitConsentGiven).toBe(true);
  });

  it("revokes explicit consent when one partner withdraws", () => {
    let state = createInitialConsentState();
    state = updateConsent(state, "A", true);
    state = updateConsent(state, "B", true);
    expect(state.explicitConsentGiven).toBe(true);
    state = updateConsent(state, "A", false);
    expect(state.explicitConsentGiven).toBe(false);
  });
});
