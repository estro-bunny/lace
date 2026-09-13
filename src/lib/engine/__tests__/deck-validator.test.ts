import { validateDeck } from "../deck-validator";

const validDeck = {
  id: "test-deck",
  name: "Test Deck",
  version: 1,
  author: "Test",
  license: "MIT",
  language: "en",
  tags: ["test"],
  cardCount: 2,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  cards: [
    {
      id: "c1",
      category: "action",
      intensity: "gentle",
      text: "Kiss them",
      bodyConfigurations: ["any"],
      genderNeutral: true,
      requiresTwo: true,
      aftercare: false,
      tags: ["kissing"],
    },
    {
      id: "c2",
      category: "question",
      intensity: "moderate",
      text: "What do you want?",
      bodyConfigurations: ["any"],
      genderNeutral: true,
      requiresTwo: false,
      aftercare: false,
      tags: ["question"],
    },
  ],
};

describe("validateDeck", () => {
  it("returns parsed deck for valid input", () => {
    const result = validateDeck(validDeck);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("test-deck");
    expect(result!.cards).toHaveLength(2);
  });

  it("returns null for missing required fields", () => {
    const incomplete = { id: "test" };
    expect(validateDeck(incomplete)).toBeNull();
  });

  it("returns null for invalid category", () => {
    const bad = {
      ...validDeck,
      cards: [{ ...validDeck.cards[0], category: "invalid" }],
    };
    expect(validateDeck(bad)).toBeNull();
  });

  it("returns null for invalid intensity", () => {
    const bad = {
      ...validDeck,
      cards: [{ ...validDeck.cards[0], intensity: "extreme" }],
    };
    expect(validateDeck(bad)).toBeNull();
  });

  it("returns null for missing cards array", () => {
    const bad = { ...validDeck, cards: undefined };
    expect(validateDeck(bad)).toBeNull();
  });

  it("accepts all valid categories", () => {
    const categories = ["question", "action", "challenge", "permission", "aftercare"];
    for (const category of categories) {
      const deck = {
        ...validDeck,
        cards: [{ ...validDeck.cards[0], category }],
      };
      expect(validateDeck(deck)).not.toBeNull();
    }
  });

  it("accepts all valid intensities", () => {
    const intensities = ["gentle", "moderate", "steamy", "intense"];
    for (const intensity of intensities) {
      const deck = {
        ...validDeck,
        cards: [{ ...validDeck.cards[0], intensity }],
      };
      expect(validateDeck(deck)).not.toBeNull();
    }
  });

  it("accepts all valid body configurations", () => {
    const configs = ["any", "has-penis", "has-vulva", "has-chest", "has-breasts", "any"];
    const deck = {
      ...validDeck,
      cards: [{ ...validDeck.cards[0], bodyConfigurations: configs }],
    };
    expect(validateDeck(deck)).not.toBeNull();
  });
});
