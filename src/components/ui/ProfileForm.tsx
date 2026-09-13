"use client";

import { useState } from "react";
import type { PartnerProfile } from "@/types/profile";
import type { GenderIdentity, BodyConfiguration } from "@/types/deck";

interface ProfileFormProps {
  onSave: (profile: PartnerProfile) => void;
}

const GENDER_OPTIONS: GenderIdentity[] = [
  "woman",
  "man",
  "nonbinary",
  "genderqueer",
  "agender",
  "bigender",
  "two-spirit",
  "questioning",
  "other",
  "prefer-not-to-say",
];

const BODY_OPTIONS: BodyConfiguration[] = [
  "any",
  "has-penis",
  "has-vulva",
  "has-chest",
  "has-breasts",
  "has-any-genitalia",
  "post-op",
  "pre-op",
  "non-op",
  "hrt",
  "other",
];

const PRONOUN_OPTIONS = [
  "she/her",
  "he/him",
  "they/them",
  "ze/zir",
  "xe/xem",
];

export default function ProfileForm({ onSave }: ProfileFormProps) {
  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("they/them");
  const [genderIdentity, setGenderIdentity] = useState<GenderIdentity>("nonbinary");
  const [bodyConfigurations, setBodyConfigurations] = useState<BodyConfiguration[]>(["any"]);
  const [hardLimits, setHardLimits] = useState("");
  const [softLimits, setSoftLimits] = useState("");

  const toggleBodyConfig = (config: BodyConfiguration) => {
    setBodyConfigurations((prev) =>
      prev.includes(config) ? prev.filter((c) => c !== config) : [...prev, config]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const now = new Date().toISOString();
    onSave({
      id: crypto.randomUUID() as PartnerProfile["id"],
      name: name.trim(),
      pronouns,
      genderIdentity,
      bodyConfigurations,
      hardLimits: hardLimits.split(",").map((s) => s.trim()).filter(Boolean),
      softLimits: softLimits.split(",").map((s) => s.trim()).filter(Boolean),
      preferences: [],
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
          Pronouns
        </label>
        <select
          value={pronouns}
          onChange={(e) => setPronouns(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
        >
          {PRONOUN_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
          Gender Identity
        </label>
        <select
          value={genderIdentity}
          onChange={(e) => setGenderIdentity(e.target.value as GenderIdentity)}
          className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
        >
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
          Body Configuration
        </label>
        <div className="flex flex-wrap gap-2">
          {BODY_OPTIONS.map((config) => (
            <button
              key={config}
              onClick={() => toggleBodyConfig(config)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                bodyConfigurations.includes(config)
                  ? "bg-primary/20 text-primary border-primary/40 shadow-sm shadow-primary/10"
                  : "bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:text-on-surface hover:border-outline-variant/40"
              }`}
            >
              {config}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
          Hard Limits (comma-separated)
        </label>
        <input
          type="text"
          value={hardLimits}
          onChange={(e) => setHardLimits(e.target.value)}
          placeholder="e.g. pain, blood, restraint"
          className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/40 focus:border-error focus:ring-2 focus:ring-error/20 focus:outline-none transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
          Soft Limits (comma-separated)
        </label>
        <input
          type="text"
          value={softLimits}
          onChange={(e) => setSoftLimits(e.target.value)}
          placeholder="e.g. light biting, hair pulling"
          className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all duration-200"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-lg hover:opacity-90 transition-all duration-200 hover-lift disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none relative overflow-hidden"
      >
        <span className="relative z-10">Save Profile</span>
        <div className="absolute inset-0 animate-shimmer" />
      </button>
    </div>
  );
}
