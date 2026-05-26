"use client";

import { useCallback, useState } from "react";
import { GRADE_INFO, type Grade } from "@/lib/types";
import GradeEffectModal from "./GradeEffectModal";

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
                className="text-center rounded-sm border border-transparent p-1 transition-colors hover:border-gray-600 hover:bg-gray-900/60 focus:outline-none focus-visible:border-indigo-400"
                aria-label={`${info.label} 카드 연출 보기`}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>

      <GradeEffectModal
        grade={selectedGrade}
        points={selectedInfo?.points ?? 0}
        onClose={closeModal}
      />
    </>
  );
}
