"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GRADE_INFO, type Grade } from "@/lib/types";
import { useRouletteSize } from "@/lib/hooks/useRouletteSize";

interface BoxOpenAnimationProps {
  isOpening: boolean;
  result: { grade: Grade; points: number } | null;
}

const BASE_PATTERN: Grade[] = [
  "common",
  "rare",
  "common",
  "epic",
  "common",
  "rare",
  "legendary",
  "common",
  "rare",
  "epic",
  "common",
  "mythic",
  "rare",
  "common",
  "legendary",
  "rare",
  "common",
  "epic",
];

const GRADE_ICONS: Record<Grade, string> = {
  common: "⬜",
  rare: "🔵",
  epic: "🟣",
  legendary: "🟡",
  mythic: "🔴",
  secret: "⬛",
};

function buildRouletteStrip(winningGrade: Grade) {
  const strip: Grade[] = [];

  for (let cycle = 0; cycle < 14; cycle++) {
    strip.push(...BASE_PATTERN);
  }

  const extraBefore =
    BASE_PATTERN.length * 2 + Math.floor(Math.random() * BASE_PATTERN.length);
  for (let i = 0; i < extraBefore; i++) {
    strip.push(BASE_PATTERN[i % BASE_PATTERN.length]);
  }

  const winnerIndex = strip.length;
  strip.push(winningGrade);

  for (let i = 0; i < 10; i++) {
    strip.push(BASE_PATTERN[i % BASE_PATTERN.length]);
  }

  return { strip, winnerIndex };
}

function RouletteItem({
  grade,
  itemWidth,
  itemHeight,
}: {
  grade: Grade;
  itemWidth: number;
  itemHeight: number;
}) {
  const info = GRADE_INFO[grade];
  return (
    <div
      className={`flex-shrink-0 border-r-2 border-gray-700 flex flex-col items-center justify-center gap-0.5 sm:gap-1 ${info.bgColor}`}
      style={{ width: itemWidth, height: itemHeight }}
    >
      <div className="text-base sm:text-xl">{GRADE_ICONS[grade]}</div>
      <div className={`text-[11px] sm:text-xs ${info.textColor}`}>
        {info.label}
      </div>
    </div>
  );
}

function RouletteViewport({
  children,
  className = "",
  containerRef,
  itemWidth,
  itemHeight,
}: {
  children: React.ReactNode;
  className?: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  itemWidth: number;
  itemHeight: number;
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-2 border-yellow-400 bg-yellow-400/10 z-10 pointer-events-none"
        style={{ width: itemWidth }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] sm:border-l-[8px] border-r-[6px] sm:border-r-[8px] border-t-[8px] sm:border-t-[10px] border-l-transparent border-r-transparent border-t-yellow-400 z-20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] sm:border-l-[8px] border-r-[6px] sm:border-r-[8px] border-b-[8px] sm:border-b-[10px] border-l-transparent border-r-transparent border-b-yellow-400 z-20" />

      <div
        ref={containerRef}
        className="overflow-hidden border-2 border-gray-700 bg-gray-900"
        style={{ height: itemHeight }}
      >
        {children}
      </div>

      <div className="absolute top-0 left-0 h-full w-10 sm:w-20 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-10 sm:w-20 bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
}

function InfiniteSpinRoulette({
  itemWidth,
  itemHeight,
}: {
  itemWidth: number;
  itemHeight: number;
}) {
  const loopPattern = useMemo(
    () => [...BASE_PATTERN, ...BASE_PATTERN, ...BASE_PATTERN],
    []
  );
  const loopWidth = loopPattern.length * itemWidth;

  return (
    <RouletteViewport itemWidth={itemWidth} itemHeight={itemHeight}>
      <motion.div
        className="flex items-center h-full will-change-transform"
        animate={{ x: [0, -loopWidth] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...loopPattern, ...loopPattern].map((grade, i) => (
          <RouletteItem
            key={i}
            grade={grade}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
          />
        ))}
      </motion.div>
    </RouletteViewport>
  );
}

function DeceleratingRoulette({
  winningGrade,
  itemWidth,
  itemHeight,
}: {
  winningGrade: Grade;
  itemWidth: number;
  itemHeight: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const { strip, winnerIndex } = useMemo(
    () => buildRouletteStrip(winningGrade),
    [winningGrade]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setContainerWidth(el.offsetWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const finalX =
    containerWidth > 0
      ? -(winnerIndex * itemWidth) + containerWidth / 2 - itemWidth / 2
      : null;

  return (
    <RouletteViewport
      className="w-full"
      containerRef={containerRef}
      itemWidth={itemWidth}
      itemHeight={itemHeight}
    >
      <motion.div
        className="flex items-center h-full will-change-transform"
        initial={false}
        animate={{ x: finalX ?? 0 }}
        transition={
          finalX !== null
            ? { duration: 4.8, ease: [0.02, 0.85, 0.12, 1] }
            : { duration: 0 }
        }
      >
        {strip.map((grade, i) => (
          <RouletteItem
            key={i}
            grade={grade}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
          />
        ))}
      </motion.div>
    </RouletteViewport>
  );
}

export default function BoxOpenAnimation({
  isOpening,
  result,
}: BoxOpenAnimationProps) {
  const { itemWidth, itemHeight } = useRouletteSize();

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
      <motion.div
        className="relative"
        animate={
          isOpening
            ? {
                rotate: [0, -3, 3, -3, 3, 0],
                scale: [1, 1.05, 1, 1.05, 1],
              }
            : { rotate: 0, scale: 1 }
        }
        transition={
          isOpening
            ? { duration: 0.4, repeat: Infinity, repeatType: "loop" }
            : { duration: 0.3 }
        }
      >
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-indigo-500 bg-indigo-950 flex items-center justify-center relative overflow-hidden"
          style={{ imageRendering: "pixelated" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/30 to-transparent" />
          <AnimatePresence mode="wait">
            {!isOpening ? (
              <motion.div
                key="closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 2 }}
                className="text-3xl sm:text-4xl"
              >
                📦
              </motion.div>
            ) : (
              <motion.div
                key="opening"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-3xl sm:text-4xl"
              >
                ✨
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute top-0 left-0 w-3 h-3 border-r-2 border-b-2 border-indigo-300 opacity-60" />
          <div className="absolute top-0 right-0 w-3 h-3 border-l-2 border-b-2 border-indigo-300 opacity-60" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-r-2 border-t-2 border-indigo-300 opacity-60" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-l-2 border-t-2 border-indigo-300 opacity-60" />
        </div>

        <AnimatePresence>
          {isOpening &&
            Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-indigo-400"
                style={{ top: "50%", left: "50%" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * 50,
                  y: Math.sin((i / 8) * Math.PI * 2) * 50,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.8, delay: i * 0.05, repeat: Infinity }}
              />
            ))}
        </AnimatePresence>
      </motion.div>

      <div className="w-full" style={{ minHeight: itemHeight + 4 }}>
        {isOpening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {result ? (
              <DeceleratingRoulette
                winningGrade={result.grade}
                itemWidth={itemWidth}
                itemHeight={itemHeight}
              />
            ) : (
              <InfiniteSpinRoulette
                itemWidth={itemWidth}
                itemHeight={itemHeight}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
