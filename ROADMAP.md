# Roadmap

## Fixed bugs
- [x] Two-thumb interactions (rope pull, the ritual's hand-off hold button) triggering the browser's pinch/double-tap zoom on mobile — locked the viewport, added `touch-action: manipulation` globally plus explicit `touch-action: none` on the two-finger surfaces, and blocked iOS Safari's `gesturestart` events directly since they fire independent of touch-action

## Phase 0 — Prove it builds
- [ ] `npm install && npm run build` on a machine with real network access
- [ ] Fix whatever TypeScript actually flags (expect small prop-shape mismatches, not structural issues — see README's verification notes)

## Phase 1 — Fill the gaps
- [x] Roulette drag-to-throw (direct wheel flick, not just hold-to-wind)
- [x] Per-partner ceiling editing after onboarding
- [x] Printable deck export (print-friendly view, no new dependency)
- [ ] Deck crossfade — blend two decks proportionally instead of picking one. Needs more UI/consent-model thought before it's worth building; not started.

## Phase 2 — Make it survive real use
- [x] Error boundaries around each game engine so a bad render doesn't take down the whole app
- [ ] First-run edge cases: 0 profiles, 1 profile, a deck with zero eligible cards at intensity 0
- [ ] Keyboard/accessibility pass — roulette and rope pull are pointer-only; TOD/WYR have no keyboard path
- [ ] Lightweight, non-invasive crash logging (nothing that phones home with personal data)

## Phase 3 — Two-phone sync (needs a real decision, not just code)
- [ ] Pick real-time infrastructure (WebSocket relay vs. a realtime DB)
- [ ] Decide what's server-stored vs. device-local, given profiles carry hard limits
- [ ] Spec before building — this is the one phase that changes the architecture

## Phase 4 — Adult-content specifics
- [ ] Age gate / self-attestation on first launch
- [ ] Real privacy policy (limits data is sensitive even in localStorage-only form)
- [ ] Distribution plan — App Store is hostile to this category even when tasteful; PWA / direct web is the realistic first channel
- [ ] Legal review of the safeword/consent framing before it's presented as more than "a game"

## Phase 5 — Backlog
- [ ] Session history / log of cards actually played and kept (opt-in, local-only)
- [ ] Build-your-own deck composer
- [ ] Wax-drip / candle timer for "wait" and "hold" cards
- [ ] Real ambient soundscape (needs actual audio assets, not synthesized clicks)
