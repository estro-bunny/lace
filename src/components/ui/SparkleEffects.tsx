"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SparkleProps {
  color?: string;
  count?: number;
  duration?: number;
  active?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const SPARKLE_COLORS = ["#ff69b4", "#60a5fa", "#c084fc", "#fbbf24", "#34d399"];

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function SparkleEffects({
  color,
  count = 12,
  duration = 0.8,
  active = true,
}: SparkleProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: random(-50, 50),
      y: random(-80, -20),
      size: random(4, 10),
      color: color || SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      delay: random(0, 0.3),
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), (duration + 0.5) * 1000);
    return () => clearTimeout(timer);
  }, [active, count, color, duration]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible z-50">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [1, 1, 0],
              x: p.x,
              y: p.y,
              scale: [0, 1.2, 0.5],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duration,
              delay: p.delay,
              ease: "easeOut",
            }}
            className="absolute left-1/2 top-1/2"
            style={{
              width: p.size,
              height: p.size,
            }}
          >
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <path
                d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"
                fill={p.color}
                filter="drop-shadow(0 0 3px currentColor)"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
