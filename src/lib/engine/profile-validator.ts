import * as v from "valibot";

const GenderIdentitySchema = v.union([
  v.literal("woman"),
  v.literal("man"),
  v.literal("nonbinary"),
  v.literal("genderqueer"),
  v.literal("agender"),
  v.literal("bigender"),
  v.literal("two-spirit"),
  v.literal("questioning"),
  v.literal("other"),
  v.literal("prefer-not-to-say"),
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

export const PartnerProfileSchema = v.object({
  id: v.string(),
  name: v.pipe(v.string(), v.minLength(1)),
  pronouns: v.string(),
  genderIdentity: GenderIdentitySchema,
  bodyConfigurations: v.array(BodyConfigurationSchema),
  hardLimits: v.array(v.string()),
  softLimits: v.array(v.string()),
  preferences: v.array(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
});

export type PartnerProfileInput = v.InferInput<typeof PartnerProfileSchema>;
export type PartnerProfileOutput = v.InferOutput<typeof PartnerProfileSchema>;

export function validateProfile(data: unknown): PartnerProfileOutput | null {
  const result = v.safeParse(PartnerProfileSchema, data);
  if (result.success) return result.output;
  console.error("Profile validation failed:", result.issues);
  return null;
}
