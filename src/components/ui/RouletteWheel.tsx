"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface RouletteWheelProps {
  segments: string[];
  colors?: string[];
  onSpinComplete: (index: number) => void;
  isSpinning: boolean;
}

const DEFAULT_COLORS = [
  "#ff69b4", "#60a5fa", "#c084fc", "#ff6b6b",
  "#34d399", "#fbbf24", "#f472b6", "#818cf8",
];

export default function RouletteWheel({
  segments,
  colors = DEFAULT_COLORS,
  onSpinComplete,
  isSpinning,
}: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const controls = useAnimation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const segmentCount = segments.length;
  const segmentAngle = 360 / segmentCount;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isSpinning) {
      spin();
    }
  }, [isSpinning]);

  const spin = useCallback(async () => {
    const extraSpins = 3 + Math.floor(Math.random() * 3);
    const randomAngle = Math.random() * 360;
    const totalRotation = extraSpins * 360 + randomAngle;
    const newRotation = rotation + totalRotation;

    setRotation(newRotation);

    await controls.start({
      rotate: newRotation,
      transition: {
        duration: 3 + Math.random() * 2,
        ease: [0.15, 0.85, 0.35, 1],
      },
    });

    const normalizedAngle = newRotation % 360;
    const winningIndex = Math.floor(
      ((360 - normalizedAngle + segmentAngle / 2) % 360) / segmentAngle
    ) % segmentCount;

    timeoutRef.current = setTimeout(() => {
      onSpinComplete(winningIndex);
    }, 500);
  }, [rotation, controls, segmentAngle, segmentCount, onSpinComplete]);

  const createSegments = () => {
    const paths: React.ReactNode[] = [];
    const cx = 150;
    const cy = 150;
    const r = 140;

    for (let i = 0; i < segmentCount; i++) {
      const startAngle = (i * segmentAngle * Math.PI) / 180;
      const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = segmentAngle > 180 ? 1 : 0;
      const midAngle = ((startAngle + endAngle) / 2);
      const textX = cx + (r * 0.65) * Math.cos(midAngle);
      const textY = cy + (r * 0.65) * Math.sin(midAngle);
      const textRotation = (midAngle * 180) / Math.PI;

      paths.push(
        <g key={i}>
          <path
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={colors[i % colors.length]}
            stroke="#0a0818"
            strokeWidth="2"
            opacity={0.9}
          />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${textRotation}, ${textX}, ${textY})`}
            fill="white"
            fontSize="10"
            fontWeight="bold"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
          >
            {segments[i].length > 12 ? segments[i].slice(0, 12) + "…" : segments[i]}
          </text>
        </g>
      );
    }
    return paths;
  };

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "24px solid #ff69b4",
            filter: "drop-shadow(0 2px 6px rgba(255,105,180,0.6))",
          }}
        />
      </div>

      {/* Wheel */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-chaos-pink/20 blur-xl animate-pulse-glow" />
        <motion.div
          animate={controls}
          className="relative"
          style={{ width: 300, height: 300 }}
        >
          <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-2xl">
            <defs>
              <filter id="wheel-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Outer ring */}
            <circle
              cx="150"
              cy="150"
              r="148"
              fill="none"
              stroke="url(#wheel-gradient)"
              strokeWidth="4"
              filter="url(#wheel-glow)"
            />
            <defs>
              <linearGradient id="wheel-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff69b4" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            {/* Segments */}
            {createSegments()}
            {/* Center circle */}
            <circle cx="150" cy="150" r="30" fill="#0a0818" stroke="#ff69b4" strokeWidth="3" />
            <text
              x="150"
              y="155"
              textAnchor="middle"
              fill="#ff69b4"
              fontSize="18"
              fontWeight="bold"
            >
              🎰
            </text>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
