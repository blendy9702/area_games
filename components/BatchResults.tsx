"use client";

import { useState } from "react";
import { GRADE_INFO, type Grade } from "@/lib/types";
import { getGradeTier, pickBestGrade } from "@/lib/grades";
import GradeEffectModal from "./GradeEffectModal";

const GRADE_ICONS: Record<Grade, string> = {
  common: "⬜",
  rare: "🔵",
  epic: "🟣",
  legendary: "🟡",
  mythic: "🔴",
  secret: "⬛",
};

interface BatchResultsProps {
  results: { grade: Grade; points: number }[];
}

export default function BatchResults({ results }: BatchResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const bestGrade = pickBestGrade(results.map((item) => item.grade));
  const totalPoints = results.reduce((sum, item) => sum + item.points, 0);
  const selectedResult = selectedIndex !== null ? results[selectedIndex] : null;

  return (
    <>
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">10연속 결과</div>
          <div className="text-xl text-yellow-300">+{totalPoints} 포인트</div>
          <div className="text-xs text-gray-600 mt-1">
            카드를 눌러 연출을 확인할 수 있습니다
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
          {results.map((item, index) => {
            const info = GRADE_INFO[item.grade];
            const isBest =
              item.grade === bestGrade && getGradeTier(item.grade) > 0;

            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`pixel-card p-2 text-center border-2 transition-colors hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${info.borderColor} ${
                  isBest
                    ? "ring-2 ring-yellow-400 shadow-[0_0_16px_rgba(251,191,36,0.35)]"
                    : ""
                }`}
                aria-label={`${info.label} 카드 연출 보기`}
              >
                <div className="text-xl mb-1">{GRADE_ICONS[item.grade]}</div>
                <div className={`text-[11px] font-bold ${info.textColor}`}>
                  {info.label}
                </div>
                <div className="text-xs text-yellow-300 mt-1">+{item.points}</div>
              </button>
            );
          })}
        </div>
      </div>

      <GradeEffectModal
        grade={selectedResult?.grade ?? null}
        points={selectedResult?.points ?? 0}
        onClose={() => setSelectedIndex(null)}
      />
    </>
  );
}
