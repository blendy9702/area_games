"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GRADE_INFO, type Grade } from "@/lib/types";
import { hasRevealEffect } from "@/lib/grades";
import GradeRevealEffects from "./GradeRevealEffects";
import ResultCard from "./ResultCard";

interface GradeEffectModalProps {
  grade: Grade | null;
  points: number;
  onClose: () => void;
}

export default function GradeEffectModal({
  grade,
  points,
  onClose,
}: GradeEffectModalProps) {
  const closeModal = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!grade) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [grade, closeModal]);

  const info = grade ? GRADE_INFO[grade] : null;

  return (
    <AnimatePresence>
      {grade && info && (
        <motion.div
          key={`grade-effect-modal-${grade}`}
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
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex flex-col items-center w-full">
              {hasRevealEffect(grade) && <GradeRevealEffects grade={grade} />}
              <ResultCard grade={grade} points={points} />
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
  );
}
