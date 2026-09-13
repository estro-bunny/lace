import { filterCards, getRandomCard } from "../deck-loader";
import type { DeckCard, DeckFilter, CardId } from "@/types/deck";

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
    tags: ["touch"],
    ...overrides,
  };
}

describe("filterCards", () => {
  const cards: DeckCard[] = [
    makeCard({ id: "c1" as CardId, category: "action", intensity: "gentle", tags: ["kissing"] }),
    makeCard({ id: "c2" as CardId, category: "question", intensity: "moderate", tags: ["emotional"] }),
    makeCard({ id: "c3" as CardId, category: "action", intensity: "steamy", genderNeutral: false, tags: ["touch", "tease"] }),
    makeCard({ id: "c4" as CardId, category: "aftercare", intensity: "gentle", tags: ["cuddling"] }),
  ];

  const emptyFilter: DeckFilter = {
    categories: [],
    intensities: [],
    genderNeutralOnly: false,
    tags: [],
    bodyConfigurations: [],
  };

  it("returns all cards with empty filter", () => {
    expect(filterCards(cards, emptyFilter)).toHaveLength(4);
  });

  it("filters by category", () => {
    expect(filterCards(cards, { ...emptyFilter, categories: ["action"] })).toHaveLength(2);
  });

  it("filters by intensity", () => {
    expect(filterCards(cards, { ...emptyFilter, intensities: ["gentle"] })).toHaveLength(2);
  });

  it("filters by genderNeutralOnly", () => {
    expect(filterCards(cards, { ...emptyFilter, genderNeutralOnly: true })).toHaveLength(3);
  });

  it("filters by tags", () => {
    expect(filterCards(cards, { ...emptyFilter, tags: ["tease"] })).toHaveLength(1);
  });

  it("filters by bodyConfigurations — specific config includes 'any' cards", () => {
    const specific = makeCard({ id: "c5" as CardId, bodyConfigurations: ["has-penis"] });
    const allCards = [...cards, specific];
    expect(filterCards(allCards, { ...emptyFilter, bodyConfigurations: ["has-penis"] })).toHaveLength(5);
  });

  it("filters by 'any' body config — only universal cards match", () => {
    const specific = makeCard({ id: "c5" as CardId, bodyConfigurations: ["has-penis"] });
    const allCards = [...cards, specific];
    expect(filterCards(allCards, { ...emptyFilter, bodyConfigurations: ["any"] })).toHaveLength(4);
  });

  it("combines multiple filters", () => {
    expect(
      filterCards(cards, {
        ...emptyFilter,
        categories: ["action"],
        intensities: ["gentle"],
      })
    ).toHaveLength(1);
  });
});

describe("getRandomCard", () => {
  const cards: DeckCard[] = [
    makeCard({ id: "c1" as CardId }),
    makeCard({ id: "c2" as CardId }),
    makeCard({ id: "c3" as CardId }),
  ];

  it("returns a card from the list", () => {
    const card = getRandomCard(cards);
    expect(card).not.toBeNull();
    expect(["c1", "c2", "c3"]).toContain(card!.id);
  });

  it("returns null for empty array", () => {
    expect(getRandomCard([])).toBeNull();
  });

  it("excludes specified card IDs", () => {
    const card = getRandomCard(cards, ["c1" as CardId, "c2" as CardId]);
    expect(card!.id).toBe("c3");
  });

  it("returns null when all cards excluded", () => {
    expect(getRandomCard(cards, ["c1" as CardId, "c2" as CardId, "c3" as CardId])).toBeNull();
  });
});
