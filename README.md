# Lace

A queer-friendly adult couples game, built around consent. Vite + React + TypeScript + Tailwind CSS + shadcn/ui.

## What's in here

- **Four real games**, each with its own engine — not one component reused four times:
  - **Truth or Dare** — swipeable card stack (Framer Motion drag), Truth/Dare/All filter
  - **Would You Rather** — drag-to-lean choice; leaning is free, only Commit locks it in
  - **Sapphic Intimacy** — two 3D dice that *actually* determine the outcome (die one picks the card, die two caps the intensity)
  - **Foreplay Roulette** — a real roulette bowl: a rotor turning one way, a ball launched the other way round the track, losing grip, bouncing off eight diamonds, rattling into a pocket. Not a tween — the deceleration is friction, computed every frame.
- **A real consent engine** — hard/soft limits per profile, a personal intensity ceiling per partner (always the lower of the shared ribbon and either partner's cap), session-only skips, and a "not ever" pass that writes new hard-limit tags on the spot.
- **The ritual** — a private, blind intensity check for each partner (screen-shield hand-off, hold-to-confirm), a qualitative reveal that never shows either partner's actual number, and a two-thumb rope pull where the tension is `min(pullA, pullB)` — it only tightens if you're both actually pulling.
- **Undo, one rung below the safeword** — every deal (swipe, roll, lock, spin) arms a plain Undo for a few seconds, no reason required.
- **The knot** — a small lace emblem that ties itself tighter as the session's total card count rises.
- **97 real cards**, ported from the four original decks, embedded as JSON in `src/lib/decks.json`.

## Setup

```bash
npm install
npm run dev
```

Then open the printed local URL. For a production build:

```bash
npm run build
npm run preview
```

## Honesty about what's been verified

This was written in a sandboxed environment with **no network access** — I could not run `npm install`, `vite build`, or a type-checked `tsc` here, because none of the dependencies (React types, Radix, Framer Motion, Tailwind, etc.) could be fetched. What I *could* do, and did, before handing this over:

- Parsed every `.ts`/`.tsx` file with the TypeScript compiler's syntax-only mode (`transpileModule`) — all 35 files are syntactically valid.
- Verified every local import (`@/...` and relative paths) resolves to a file that actually exists.
- Verified every named import matches a real named export in its target file.
- Verified every external package imported in source is declared in `package.json`.
- Verified every custom Tailwind color/radius/animation class used in a component is actually defined in `tailwind.config.ts`.

What that *doesn't* catch: type errors (a prop of the wrong shape, a typo'd property name that happens to also be valid JS), and anything that only shows up once real React/Radix/Framer Motion types are in the loop. Run `npm run build` after installing — if TypeScript finds anything, it'll be a real type mismatch, not a hallucinated import or a missing file.

## Known gaps versus the original prototype

- **Two-phone sync** is not implemented anywhere — it needs a real signaling backend (WebSocket relay, Firebase, etc.), which is a server, not a frontend feature. See `ROADMAP.md` Phase 3.
- **Deck crossfade** (blending two decks proportionally instead of picking one) isn't built. It needs more consent-model thought than the other items before it's worth shipping — see `ROADMAP.md` Phase 1.

Since the first draft, these have been closed:
- Roulette now supports both hold-to-wind **and** a direct finger-flick on the wheel itself — exit velocity comes from recent pointer history, same as the original prototype.
- Per-partner intensity ceilings are editable after onboarding, from the Home screen, not just set once at profile creation.
- Any deck can be exported as a print-and-cut card sheet (`PrintableDeck.tsx`) — filtered to the current eligible pool, no PDF library required, just `window.print()` and print-media CSS.

## Project structure

```
src/
  lib/           consent engine, text renderer, deck data, types, zustand store lives in src/store
  store/         useLaceStore.ts — persisted app state (localStorage, key "lace-store")
  components/
    ui/          shadcn primitives (button, card, sheet, slider)
    shared/      background, top bar, ribbon, sheets, toast, session knot
    screens/     onboarding, home, decks, game shell, aftercare
    ritual/      private gauge, hold-to-confirm hand-off, rope pull
    games/       TruthOrDare, WouldYouRather, SexyDice, ForeplayRoulette
```

## Adding more shadcn components

This repo includes a hand-written `components.json` so the real shadcn CLI works normally:

```bash
npx shadcn@latest add dialog
```
