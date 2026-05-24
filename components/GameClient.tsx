"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { GRADE_INFO, type Grade, type GameProfile } from "@/lib/types";
import { ALL_GRADES, getGradeTier, hasRevealEffect } from "@/lib/grades";
import { formatTokens, hasTokens } from "@/lib/tokens";
import BoxOpenAnimation from "./BoxOpenAnimation";
import GradeRevealEffects from "./GradeRevealEffects";
import ResultCard from "./ResultCard";
import { playGradeRevealSound, resumeAudioContext } from "@/lib/gradeSounds";

interface GameClientProps {
  profile: GameProfile;
  setProfile: React.Dispatch<React.SetStateAction<GameProfile>>;
  userId: string;
  isAdmin: boolean;
}

export default function GameClient({
  profile,
  setProfile,
  userId,
  isAdmin,
}: GameClientProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [result, setResult] = useState<{ grade: Grade; points: number } | null>(
    null
  );
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");

  const finishAnimation = useCallback((boxResult: { grade: Grade; points: number }) => {
    setResult(boxResult);
    setTimeout(() => {
      setShowResult(true);
      setIsOpening(false);
    }, 5200);
  }, []);

  useEffect(() => {
    if (showResult && result) {
      playGradeRevealSound(result.grade);
    }
  }, [showResult, result]);

  const runBoxOpen = useCallback(
    async (testGrade?: Grade) => {
      const isTest = Boolean(testGrade);

      if (!isTest && !hasTokens(profile.tokens, isAdmin)) {
        setError("토큰이 부족합니다! 어드민에게 토큰을 요청하세요.");
        return;
      }
      if (isOpening) return;

      resumeAudioContext();
      setError("");
      setIsOpening(true);
      setShowResult(false);
      setResult(null);

      const supabase = createClient();
      const { data, error: rpcError } = isTest
        ? await supabase.rpc("admin_test_open_box", {
            p_user_id: userId,
            p_grade: testGrade,
          })
        : await supabase.rpc("open_game_box", { p_user_id: userId });

      if (rpcError) {
        setError(rpcError.message);
        setIsOpening(false);
        return;
      }

      const boxResult = data as { grade: Grade; points: number };

      setProfile((prev) => ({
        ...prev,
        tokens: isTest || isAdmin ? prev.tokens : prev.tokens - 1,
        total_boxes_opened: prev.total_boxes_opened + 1,
      }));

      finishAnimation(boxResult);
    },
    [profile.tokens, isOpening, userId, isAdmin, setProfile, finishAnimation]
  );

  const openBox = useCallback(() => runBoxOpen(), [runBoxOpen]);
  const testOpen = useCallback(
    (grade: Grade) => runBoxOpen(grade),
    [runBoxOpen]
  );

  const resetGame = () => {
    setShowResult(false);
    setResult(null);
  };

  const gradeInfo = result ? GRADE_INFO[result.grade] : null;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-8 w-full">
      <div className="text-center w-full">
        <h1 className="text-base sm:text-xl text-indigo-300 pixel-glow mb-2">
          🎲 랜덤박스
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 text-sm text-gray-400">
          <span>
            플레이어:{" "}
            <span className="text-indigo-300">{profile.username}</span>
          </span>
          <span>
            오픈:{" "}
            <span className="text-green-300">{profile.total_boxes_opened}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 pixel-card px-5 sm:px-8 py-3 sm:py-4 w-full max-w-xs sm:max-w-none sm:w-auto justify-center">
        <span className="text-2xl token-shine">🎫</span>
        <div>
          <div className="text-sm text-gray-500 mb-1">토큰</div>
          <div className="text-xl sm:text-2xl text-yellow-300">
            {formatTokens(profile.tokens, isAdmin)}
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg px-0 sm:px-0">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-6"
            >
              <BoxOpenAnimation isOpening={isOpening} result={result} />

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm border border-red-800 bg-red-950 p-3 text-center w-full"
                >
                  ⚠ {error}
                </motion.div>
              )}

              <motion.button
                onClick={openBox}
                disabled={isOpening || !hasTokens(profile.tokens, isAdmin)}
                className={`pixel-btn w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-4 ${
                  !hasTokens(profile.tokens, isAdmin)
                    ? "opacity-40 cursor-not-allowed border-gray-700 text-gray-500 bg-gray-900"
                    : "pixel-btn-primary"
                }`}
                whileHover={
                  hasTokens(profile.tokens, isAdmin) && !isOpening
                    ? { scale: 1.05 }
                    : {}
                }
                whileTap={
                  hasTokens(profile.tokens, isAdmin) && !isOpening
                    ? { scale: 0.95 }
                    : {}
                }
              >
                {isOpening
                  ? "오픈 중..."
                  : !hasTokens(profile.tokens, isAdmin)
                  ? "토큰 없음"
                  : isAdmin
                  ? "🎲 박스 열기"
                  : "🎲 박스 열기 (-1🎫)"}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                x: result && getGradeTier(result.grade) >= 3 ? [0, -4, 4, -3, 3, 0] : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                x: { duration: 0.5, delay: 0.1 },
              }}
              className="flex flex-col items-center gap-6 relative z-50"
            >
              {result && hasRevealEffect(result.grade) && (
                <GradeRevealEffects grade={result.grade} />
              )}
              {gradeInfo && result && (
                <ResultCard grade={result.grade} points={result.points} />
              )}
              <button
                onClick={resetGame}
                className="pixel-btn pixel-btn-primary w-full sm:w-auto text-sm sm:text-base px-6 py-3 relative z-50"
              >
                ▶ 다시 열기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isAdmin && !isOpening && !showResult && (
        <div className="w-full max-w-2xl pixel-card border-2 border-dashed border-yellow-700/80">
          <div className="text-sm text-yellow-500 mb-1 text-center">
            ── 어드민 테스트 ──
          </div>
          <div className="text-xs text-gray-600 text-center mb-3">
            등급별 이펙트 실험 (토큰 소모 없음)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_GRADES.map((grade) => {
              const info = GRADE_INFO[grade];
              return (
                <button
                  key={grade}
                  onClick={() => testOpen(grade)}
                  className={`pixel-btn text-xs px-2 py-2 border-2 ${info.borderColor} ${info.bgColor} hover:brightness-125`}
                >
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl">
        <div className="text-sm text-gray-500 text-center mb-3">
          ── 등급표 ──
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(GRADE_INFO) as [Grade, (typeof GRADE_INFO)[Grade]][]).map(
            ([grade, info]) => (
              <div
                key={grade}
                className={`pixel-card p-3 border-2 ${info.borderColor}`}
              >
                <div className={`text-sm font-bold mb-1 ${info.textColor}`}>
                  {grade === "mythic" ? (
                    <span className="rainbow-text-intense">{info.label}</span>
                  ) : grade === "epic" ? (
                    <span className="epic-text">{info.label}</span>
                  ) : grade === "secret" ? (
                    <span className="glitch-effect" data-text={info.label}>
                      {info.label}
                    </span>
                  ) : grade === "legendary" ? (
                    <span className="golden-text">{info.label}</span>
                  ) : (
                    info.label
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {info.points}pt · {info.probability}%
                  {getGradeTier(grade) >= 1 && (
                    <span className="text-purple-400"> · 연출</span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
