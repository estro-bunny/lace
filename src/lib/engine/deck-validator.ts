import * as v from "valibot";

const CardCategorySchema = v.union([
  v.literal("question"),
  v.literal("action"),
  v.literal("challenge"),
  v.literal("permission"),
  v.literal("aftercare"),
]);

const IntensityLevelSchema = v.union([
  v.literal("gentle"),
  v.literal("moderate"),
  v.literal("steamy"),
  v.literal("intense"),
]);

const BodyConfigurationSchema = v.union([
  v.literal("any"),
  v.literal("has-penis"),
  v.literal("has-vulva"),
  v.literal("has-chest"),
  v.literal("has-breasts"),
  v.literal("has-any-genitalia"),
  v.literal("post-op"),
  v.literal("pre-op"),
  v.literal("non-op"),
  v.literal("hrt"),
  v.literal("other"),
]);

const DeckCardSchema = v.object({
  id: v.string(),
  category: CardCategorySchema,
  intensity: IntensityLevelSchema,
  text: v.string(),
  bodyConfigurations: v.array(BodyConfigurationSchema),
  genderNeutral: v.boolean(),
  requiresTwo: v.boolean(),
  aftercare: v.boolean(),
  tags: v.array(v.string()),
});

export const DeckSchema = v.object({
  id: v.string(),
  name: v.string(),
  version: v.number(),
  author: v.string(),
  license: v.string(),
  language: v.string(),
  tags: v.array(v.string()),
  cardCount: v.number(),
  createdAt: v.string(),
  updatedAt: v.string(),
  cards: v.array(DeckCardSchema),
});

export type DeckInput = v.InferInput<typeof DeckSchema>;
export type DeckOutput = v.InferOutput<typeof DeckSchema>;

export function validateDeck(data: unknown): DeckOutput | null {
  const result = v.safeParse(DeckSchema, data);
  if (result.success) return result.output;
  console.error("Deck validation failed:", result.issues);
  return null;
}
