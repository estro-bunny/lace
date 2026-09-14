"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import SafewordButton from "@/components/ui/SafewordButton";

export default function Navbar() {
  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(255,105,180,0.1)]">
        <nav
          className="flex justify-between items-center px-8 h-20"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-8">
            <Logo size="sm" />
            <div className="hidden md:flex gap-6 items-center">
              <Link
                href="/games"
                className="font-headline tracking-tight text-on-surface-variant hover:text-chaos-pink transition-colors duration-300"
              >
                Games
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-on-surface-variant/60 font-medium">
              🏳️‍⚧️ still here ™
            </span>
            <SafewordButton />
          </div>
        </nav>
      </header>
      <div
        className="fixed top-20 w-full h-px bg-gradient-to-b from-chaos-pink/20 via-chaos-blue/10 to-transparent z-40"
        aria-hidden="true"
      />
    </>
  );
}
