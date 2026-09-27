import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/lib/toast";

export function Toaster() {
  const message = useToastStore((s) => s.message);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-32 z-[60] flex justify-center">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className="rounded-full border border-white/[0.18] bg-ink-3 px-[17px] py-2.5 text-[12.5px] shadow-[0_14px_34px_-10px_rgba(0,0,0,0.8)]"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
