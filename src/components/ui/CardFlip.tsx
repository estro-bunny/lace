"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CardFlipProps {
  isFlipped: boolean;
  front: React.ReactNode;
  back?: React.ReactNode;
  className?: string;
}

function CardBack() {
  return (
    <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden">
      <div className="w-full h-full bg-gradient-to-br from-[#1a1030] to-[#0d0820] border-2 border-chaos-pink/30 rounded-2xl flex items-center justify-center relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-2 border border-chaos-pink/20 rounded-xl" />
          <div className="absolute inset-4 border border-chaos-purple/15 rounded-lg" />
        </div>
        <div className="relative flex flex-col items-center gap-2">
          <span className="text-5xl">🐰</span>
          <div className="flex gap-1">
            <span className="text-chaos-pink text-xs font-bold">L</span>
            <span className="text-chaos-blue text-xs font-bold">A</span>
            <span className="text-chaos-purple text-xs font-bold">C</span>
            <span className="text-chaos-pink text-xs font-bold">E</span>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chaos-pink via-chaos-blue to-chaos-purple" />
      </div>
    </div>
  );
}

export default function CardFlip({ isFlipped, front, back, className = "" }: CardFlipProps) {
  return (
    <div
      className={`relative w-full max-w-lg mx-auto ${className}`}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.7,
          type: "spring",
          stiffness: 80,
          damping: 15,
        }}
      >
        {/* Back of card (visible when not flipped) */}
        <div className="backface-hidden">
          {back || <CardBack />}
        </div>

        {/* Front of card (visible when flipped) */}
        <div
          className="backface-hidden absolute inset-0"
          style={{ transform: "rotateY(180deg)" }}
        >
          {front}
        </div>
      </motion.div>
    </div>
  );
}
