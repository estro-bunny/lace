import { renderCardText, resolvePronouns } from "../text-renderer";
import type { PartnerProfile } from "@/types/profile";
import type { ProfileId } from "@/types/profile";

function makeProfile(overrides: Partial<PartnerProfile>): PartnerProfile {
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

describe("renderCardText", () => {
  it("resolves {partner1} to first profile name", () => {
    const profiles = [makeProfile({ name: "Jade" })];
    expect(renderCardText("Kiss {partner1} gently", profiles)).toBe("Kiss Jade gently");
  });

  it("resolves {partner1_subject} for she/her", () => {
    const profiles = [makeProfile({ pronouns: "she/her" })];
    expect(renderCardText("{partner1_subject} is here", profiles)).toBe("she is here");
  });

  it("resolves {partner1_object} for he/him", () => {
    const profiles = [makeProfile({ pronouns: "he/him" })];
    expect(renderCardText("Kiss {partner1_object}", profiles)).toBe("Kiss him");
  });

  it("resolves {partner1_possessive} for they/them", () => {
    const profiles = [makeProfile({ pronouns: "they/them" })];
    expect(renderCardText("{partner1_possessive} body", profiles)).toBe("their body");
  });

  it("resolves both partners in same template", () => {
    const profiles = [
      makeProfile({ name: "Jade", pronouns: "she/her" }),
      makeProfile({ id: "p2" as ProfileId, name: "Sage", pronouns: "they/them" }),
    ];
    const result = renderCardText("{partner1} touches {partner2_possessive} {partner2_object}", profiles);
    expect(result).toBe("Jade touches their them");
  });

  it("resolves {name1} and {name2}", () => {
    const profiles = [
      makeProfile({ name: "Jade" }),
      makeProfile({ id: "p2" as ProfileId, name: "Sage" }),
    ];
    expect(renderCardText("{name1} and {name2}", profiles)).toBe("Jade and Sage");
  });

  it("handles ze/zir pronouns", () => {
    const profiles = [makeProfile({ pronouns: "ze/zir" })];
    expect(renderCardText("{partner1_subject} {partner1_object} {partner1_possessive}", profiles)).toBe("ze zir zir");
  });

  it("handles xe/xem pronouns", () => {
    const profiles = [makeProfile({ pronouns: "xe/xem" })];
    expect(renderCardText("{partner1_subject} {partner1_object} {partner1_possessive}", profiles)).toBe("xe xem xyr");
  });

  it("leaves text without placeholders unchanged", () => {
    const profiles = [makeProfile({ name: "Alex" })];
    expect(renderCardText("No placeholders here", profiles)).toBe("No placeholders here");
  });

  it("does not auto-capitalize pronouns (template authors control casing)", () => {
    const profiles = [makeProfile({ pronouns: "she/her" })];
    const result = renderCardText("{partner1_subject} is ready", profiles);
    expect(result).toBe("she is ready");
  });
});
