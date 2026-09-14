"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import ProfileForm from "@/components/ui/ProfileForm";
import type { PartnerProfile } from "@/types/profile";
import { getProfiles, saveProfile } from "./actions";

export default function Home() {
  const [profiles, setProfiles] = useState<PartnerProfile[]>([]);
  const [step, setStep] = useState<"profiles" | "ready">("profiles");
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    getProfiles()
      .then((p) => {
        setProfiles(p);
        if (p.length >= 2) setStep("ready");
      })
      .catch((err) => {
        setDbError("Could not connect to local database. Is PostgreSQL running?");
        console.error(err);
      });
  }, []);

  const handleProfileSave = async (profile: PartnerProfile) => {
    try {
      await saveProfile(profile);
      const updated = await getProfiles();
      setProfiles(updated);
      if (updated.length >= 2) setStep("ready");
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  if (dbError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 gap-6 relative z-10">
        <div className="animate-fade-in-up">
          <Logo size="lg" />
        </div>
        <div className="glass-card rounded-2xl border border-error/40 p-8 max-w-lg text-center space-y-4 animate-fade-in-up stagger-2" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
          <p className="text-error font-bold text-lg">Database Connection Error</p>
          <p className="text-on-surface-variant">{dbError}</p>
          <p className="text-on-surface-variant text-sm">
            Make sure PostgreSQL is running locally and the DATABASE_URL in .env.local is correct.
          </p>
          <code className="block text-xs text-on-surface-variant bg-surface-container p-3 rounded-xl mt-4">
            psql -U postgres -c "CREATE DATABASE lace;"
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 relative z-10">
      <div className="max-w-lg w-full space-y-12 text-center">
        <div className="flex justify-center animate-fade-in-up">
          <Logo size="lg" />
        </div>

        <p className="text-on-surface-variant text-lg animate-fade-in-up stagger-1" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          queer couple games built with chaos, caffeine, and way too much estrogen 🐇💗
        </p>

        {step === "profiles" && (
          <div className="space-y-8 text-left animate-fade-in-up stagger-2" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <div className="text-center">
              <h2 className="text-2xl font-headline font-bold text-on-surface">
                {profiles.length === 0
                  ? "Create your first profile"
                  : "Create your partner's profile"}
              </h2>
              <p className="text-on-surface-variant text-sm mt-2">
                {profiles.length + 1} of 2 profiles created
              </p>
            </div>
            <ProfileForm onSave={handleProfileSave} />
          </div>
        )}

        {step === "ready" && (
          <div className="space-y-6 animate-fade-in-up stagger-2" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <div className="glass-card rounded-2xl border border-outline-variant/20 p-6 space-y-3 animate-glow-pulse">
              {profiles.map((p, i) => (
                <div key={p.id} className={`flex items-center justify-between ${i > 0 ? "pt-3 border-t border-outline-variant/10" : ""}`}>
                  <span className="font-headline font-bold text-on-surface">{p.name}</span>
                  <span className="text-sm text-on-surface-variant">{p.pronouns}</span>
                </div>
              ))}
            </div>
            <Link
              href="/games"
              className="block w-full py-4 rounded-xl bg-gradient-to-r from-chaos-blue via-chaos-pink to-chaos-purple text-white font-bold text-lg text-center hover:opacity-90 transition-all hover-lift border-glow relative overflow-hidden animate-pulse-glow"
            >
              <span className="relative z-10">🎮 Choose a Game 🐰</span>
              <div className="absolute inset-0 animate-shimmer" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
