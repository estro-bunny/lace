import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation, type PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import { eligiblePool, shuffle, softBadge } from "@/lib/consent";
import { renderCardText } from "@/lib/textRenderer";
import { useLaceStore } from "@/store/useLaceStore";
import { HUE, type Card, type CardCategory, type DeckId } from "@/lib/types";
import type { GameApi } from "@/components/screens/GameScreen";

const EMPTY_CARD: Card = {
  id: "__empty",
  category: "question",
  intensity: "gentle",
  text: "Nothing in range. Ease the intensity or switch decks.",
  tags: [],
};

type Filter = "all" | "question" | "action";

export function TruthOrDare({ deckId, api }: { deckId: DeckId; api: GameApi }) {
  const store = useLaceStore();
  const ctx = {
    profiles: store.profiles,
    sharedTier: store.sharedTier,
    extraHardTags: store.extraHardTags,
    sessionSkip: store.sessionSkip,
  };
  const [filter, setFilter] = useState<Filter>("all");
  const [stack, setStack] = useState<Card[]>([]);
  const preUndo = useRef<{ turn: 0 | 1; card: Card; stack: Card[] } | null>(null);

  const categories = filter === "all" ? undefined : ([filter] as CardCategory[]);
  const { pool, available } = eligiblePool(deckId, ctx, { categories });

  useEffect(() => {
    let list = shuffle(available).slice(0, 4);
    if (!list.length) list = [EMPTY_CARD];
    setStack(list);
    api.registerUndo(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, deckId, store.sharedTier, store.extraHardTags.join(","), store.sessionSkip.join(",")]);

  function refillFrom(current: Card[]) {
    const more = shuffle(available.filter((c) => !current.some((s) => s.id === c.id)));
    const next = current.concat(more).slice(0, 4);
    return next.length ? next : [EMPTY_CARD];
  }

  function advance(card: Card) {
    if (card.id === "__empty") return;
    preUndo.current = { turn: store.turn, card, stack };
    store.recordDeal();
    setStack((s) => refillFrom(s.slice(1)));
    api.registerUndo(() => {
      if (!preUndo.current) return;
      const snap = preUndo.current;
      store.undoDeal(snap.turn);
      setStack(snap.stack);
      api.registerUndo(null);
    });
  }

  function pass(card: Card) {
    if (card.id === "__empty") return;
    api.requestPass(card);
    setStack((s) => refillFrom(s.slice(1)));
  }

  const top = stack[0];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-center gap-2 px-5 pt-2">
        {(["all", "question", "action"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
              filter === f
                ? "border-transparent bg-accent text-[#1A0710] transition-accent"
                : "border-hairline bg-white/[0.03] text-silk-dim hover:text-silk"
            }`}
          >
            {f === "all" ? "All" : f === "question" ? "Truth" : "Dare"}
          </button>
        ))}
      </div>

      <div className="relative mx-5 mt-2 flex flex-1 items-center justify-center">
        {stack
          .slice(0, 3)
          .map((c, i) => i)
          .reverse()
          .map((i) => (
            <StackCard
              key={`${stack[i]?.id}-${i}`}
              card={stack[i]}
              depth={i}
              onSwipe={(dir) => (dir === "right" ? advance(stack[i]) : pass(stack[i]))}
            />
          ))}
      </div>

      <div className="flex justify-center gap-[5px] pt-2.5">
        {Array.from({ length: Math.min(5, Math.max(stack.length, 1)) }).map((_, i) => (
          <span key={i} className={`h-1 w-1 rounded-full ${i < stack.length ? "bg-accent transition-accent" : "bg-white/[0.18]"}`} />
        ))}
      </div>
      <p className="pt-1 text-center text-[11px] text-silk-faint">
        {pool.length} card{pool.length === 1 ? "" : "s"} in range
      </p>

      <div className="grid grid-cols-2 gap-2.5 px-5 pt-2.5">
        <Button variant="ghost" disabled={!top || top.id === "__empty"} onClick={() => top && pass(top)}>
          Pass
        </Button>
        <Button disabled={!top || top.id === "__empty"} onClick={() => top && advance(top)}>
          Deal
        </Button>
      </div>
    </div>
  );
}

function StackCard({
  card,
  depth,
  onSwipe,
}: {
  card: Card;
  depth: number;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const controls = useAnimation();
  const profiles = useLaceStore((s) => s.profiles);
  const turn = useLaceStore((s) => s.turn);
  const store = useLaceStore();
  const ctx = useMemo(
    () => ({
      profiles: store.profiles,
      sharedTier: store.sharedTier,
      extraHardTags: store.extraHardTags,
      sessionSkip: store.sessionSkip,
    }),
    [store.profiles, store.sharedTier, store.extraHardTags, store.sessionSkip],
  );
  const isTop = depth === 0;
  const isSoft = card.id !== "__empty" && softBadge(card, ctx);
  const [p1] = [profiles[turn], profiles[1 - turn]];
  const text = card.id === "__empty" ? card.text : renderCardText(card.text, profiles[turn], profiles[1 - turn]);
  const kind = card.category === "question" ? "Truth" : card.category === "action" ? "Dare" : card.category;

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (!isTop) return;
    const dx = info.offset.x;
    if (Math.abs(dx) > 96) {
      const dir = dx > 0 ? "right" : "left";
      controls
        .start({
          x: dir === "right" ? 560 : -560,
          y: info.offset.y * 0.4 + 40,
          rotate: dir === "right" ? 26 : -26,
          opacity: 0,
          transition: { duration: 0.42, ease: [0.22, 0.61, 0.36, 1] },
        })
        .then(() => onSwipe(dir));
      if (navigator.vibrate) navigator.vibrate(dir === "right" ? 12 : [8, 40, 8]);
    } else {
      controls.start({ x: 0, y: 0, rotate: 0, transition: { type: "spring", stiffness: 400, damping: 30 } });
    }
  }

  return (
    <motion.article
      className="lace-card absolute flex w-full max-w-[320px] flex-col overflow-hidden rounded-card border p-[22px]"
      style={{
        aspectRatio: "3/4",
        maxHeight: "100%",
        zIndex: 10 - depth,
        y: depth * -9,
        scale: 1 - depth * 0.038,
        opacity: depth === 0 ? 1 : depth === 1 ? 0.6 : 0.3,
      }}
      drag={isTop ? "x" : false}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={isTop ? { cursor: "grabbing" } : undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full border px-2.5 py-[3px] text-[10.5px] font-semibold"
          style={{ color: HUE[card.intensity], borderColor: HUE[card.intensity] }}
        >
          {card.intensity}
        </span>
        <span className="text-[11.5px] text-silk-faint">{kind}</span>
        {isSoft && (
          <span className="rounded-full border border-amber/40 px-2 py-0.5 text-[10px] font-semibold text-amber">
            soft limit
          </span>
        )}
      </div>
      <p className="font-display my-auto py-4 text-[clamp(22px,6vw,27px)] font-normal leading-[1.24] tracking-[-0.016em]">
        {text}
      </p>
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {card.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full border border-hairline px-2 py-[3px] text-[10.5px] text-silk-faint">
              {t}
            </span>
          ))}
        </div>
        {card.id !== "__empty" && (
          <div className="whitespace-nowrap text-[11.5px] text-silk-dim">
            for <b className="font-medium text-silk">{p1.name}</b>
          </div>
        )}
      </div>
    </motion.article>
  );
}
