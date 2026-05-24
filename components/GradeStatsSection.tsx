"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GRADE_INFO, type Grade } from "@/lib/types";
import { hasRevealEffect } from "@/lib/grades";
import GradeRevealEffects from "./GradeRevealEffects";
import ResultCard from "./ResultCard";

const GRADE_ORDER: Grade[] = [
  "secret",
  "mythic",
  "legendary",
  "epic",
  "rare",
  "common",
];

const GRADE_ICONS: Record<Grade, string> = {
  common: "⬜",
  rare: "🔵",
  epic: "🟣",
  legendary: "🟡",
  mythic: "🔴",
  secret: "⬛",
};

interface GradeStatsSectionProps {
  stats: Partial<Record<Grade, number>>;
  totalCount: number;
}

export default function GradeStatsSection({
  stats,
  totalCount,
}: GradeStatsSectionProps) {
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const closeModal = useCallback(() => setSelectedGrade(null), []);

  useEffect(() => {
    if (!selectedGrade) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedGrade, closeModal]);

  const selectedInfo = selectedGrade ? GRADE_INFO[selectedGrade] : null;

  return (
    <>
      <div className="pixel-card mb-6">
        <div className="text-sm text-gray-500 mb-1">── 등급 통계 ──</div>
        <div className="text-xs text-gray-600 mb-3">
          뽑은 카드는 클릭하여 연출을 다시 볼 수 있습니다
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {GRADE_ORDER.map((grade) => {
            const info = GRADE_INFO[grade];
            const count = stats[grade] || 0;
            const pct =
              totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : "0";
            const isUnlocked = count > 0;

            const content = (
              <>
                <div className="text-lg mb-1">{GRADE_ICONS[grade]}</div>
                <div className={`text-xs sm:text-sm ${info.textColor} mb-1`}>
                  {info.label}
                </div>
                <div className="text-sm text-white">{count}</div>
                <div className="text-xs text-gray-500">{pct}%</div>
              </>
            );

            if (!isUnlocked) {
              return (
                <div
                  key={grade}
                  className="text-center opacity-35 cursor-not-allowed"
                  aria-disabled
                >
                  {content}
                </div>
              );
            }

            return (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={`text-center rounded-sm border border-transparent p-1 transition-colors hover:border-gray-600 hover:bg-gray-900/60 focus:outline-none focus-visible:border-indigo-400`}
                aria-label={`${info.label} 카드 연출 보기`}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedGrade && selectedInfo && (
          <motion.div
            key="grade-effect-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={closeModal}
              aria-label="닫기"
            />

            <motion.div
              className="relative z-10 flex flex-col items-center gap-4 w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.85, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex flex-col items-center w-full">
                {hasRevealEffect(selectedGrade) && (
                  <GradeRevealEffects grade={selectedGrade} />
                )}
                <ResultCard
                  grade={selectedGrade}
                  points={selectedInfo.points}
                />
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="pixel-btn pixel-btn-primary w-full text-sm px-6 py-3 relative z-50"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
