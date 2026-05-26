"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { GRADE_INFO, type Grade, type GameProfile } from "@/lib/types";
import { ALL_GRADES, getGradeTier, hasRevealEffect, pickBestGrade } from "@/lib/grades";
import { formatTokens, hasTokens } from "@/lib/tokens";
import BoxOpenAnimation from "./BoxOpenAnimation";
import GradeRevealEffects from "./GradeRevealEffects";
import ResultCard from "./ResultCard";
import BatchResults from "./BatchResults";
import {
  playGradeRevealSound,
  resumeAudioContext,
  stopRouletteSound,
} from "@/lib/gradeSounds";

type BoxResult = { grade: Grade; points: number };

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
  const [spinResult, setSpinResult] = useState<BoxResult | null>(null);
  const [displayResults, setDisplayResults] = useState<BoxResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isBatchOpening, setIsBatchOpening] = useState(false);
  const [error, setError] = useState("");
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAnimationTimeout = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  const revealResults = useCallback(
    (results: BoxResult[]) => {
      clearAnimationTimeout();
      stopRouletteSound();
      setDisplayResults(results);
      setShowResult(true);
      setIsOpening(false);
      setIsBatchOpening(false);
    },
    [clearAnimationTimeout]
  );

  const finishSingleAnimation = useCallback(
    (boxResult: BoxResult) => {
      setSpinResult(boxResult);
      clearAnimationTimeout();
      animationTimeoutRef.current = setTimeout(() => {
        revealResults([boxResult]);
      }, 5200);
    },
    [clearAnimationTimeout, revealResults]
  );

  const skipAnimation = useCallback(() => {
    if (!spinResult) return;
    revealResults([spinResult]);
  }, [spinResult, revealResults]);

  useEffect(() => {
    return () => clearAnimationTimeout();
  }, [clearAnimationTimeout]);

  useEffect(() => {
    if (!showResult || displayResults.length === 0) return;

    const bestGrade = pickBestGrade(displayResults.map((item) => item.grade));
    playGradeRevealSound(bestGrade);
  }, [showResult, displayResults]);

  const runBoxOpen = useCallback(
    async (options?: { count?: 1 | 10; testGrade?: Grade }) => {
      const count = options?.count ?? 1;
      const testGrade = options?.testGrade;
      const isTest = Boolean(testGrade);

      if (!isTest && !hasTokens(profile.tokens, isAdmin, count)) {
        setError(
          count === 10
            ? "토큰이 10개 이상 필요합니다! 어드민에게 토큰을 요청하세요."
            : "토큰이 부족합니다! 어드민에게 토큰을 요청하세요."
        );
        return;
      }
      if (isOpening) return;

      resumeAudioContext();
      setError("");
      setIsOpening(true);
      setShowResult(false);
      setSpinResult(null);
      setDisplayResults([]);
      setIsBatchOpening(count === 10);

      const supabase = createClient();
      const opened: BoxResult[] = [];

      for (let i = 0; i < count; i++) {
        const { data, error: rpcError } = isTest
          ? await supabase.rpc("admin_test_open_box", {
              p_user_id: userId,
              p_grade: testGrade,
            })
          : await supabase.rpc("open_game_box", { p_user_id: userId });

        if (rpcError) {
          if (opened.length > 0) {
            setProfile((prev) => ({
              ...prev,
              tokens: isTest || isAdmin ? prev.tokens : prev.tokens - opened.length,
              total_boxes_opened: prev.total_boxes_opened + opened.length,
              total_points:
                prev.total_points +
                opened.reduce((sum, item) => sum + item.points, 0),
            }));
            if (count === 10) {
              revealResults(opened);
            }
          } else {
            setIsOpening(false);
            setIsBatchOpening(false);
          }
          setError(rpcError.message);
          return;
        }

        opened.push(data as BoxResult);
      }

      setProfile((prev) => ({
        ...prev,
        tokens: isTest || isAdmin ? prev.tokens : prev.tokens - opened.length,
        total_boxes_opened: prev.total_boxes_opened + opened.length,
        total_points:
          prev.total_points +
          opened.reduce((sum, item) => sum + item.points, 0),
      }));

      if (count === 1) {
        finishSingleAnimation(opened[0]);
      } else {
        revealResults(opened);
      }
    },
    [
      profile.tokens,
      isOpening,
      userId,
      isAdmin,
      setProfile,
      finishSingleAnimation,
      revealResults,
    ]
  );

  const openBox = useCallback(() => runBoxOpen({ count: 1 }), [runBoxOpen]);
  const openBoxTen = useCallback(() => runBoxOpen({ count: 10 }), [runBoxOpen]);
  const testOpen = useCallback(
    (grade: Grade) => runBoxOpen({ count: 1, testGrade: grade }),
    [runBoxOpen]
  );

  const resetGame = () => {
    clearAnimationTimeout();
    stopRouletteSound();
    setShowResult(false);
    setSpinResult(null);
    setDisplayResults([]);
    setIsBatchOpening(false);
  };

  const isBatchResult = displayResults.length > 1;
  const singleResult = displayResults.length === 1 ? displayResults[0] : null;
  const gradeInfo = singleResult ? GRADE_INFO[singleResult.grade] : null;
  const canOpen = hasTokens(profile.tokens, isAdmin, 1);
  const canOpenTen = hasTokens(profile.tokens, isAdmin, 10);
  const canSkip = isOpening && spinResult !== null && !showResult;

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
              {isBatchOpening ? (
                <div className="w-full flex flex-col items-center gap-3 py-8">
                  <div className="text-4xl animate-pulse">📦</div>
                  <div className="text-sm text-gray-400">10개의 박스를 여는 중...</div>
                </div>
              ) : (
                <BoxOpenAnimation isOpening={isOpening} result={spinResult} />
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm border border-red-800 bg-red-950 p-3 text-center w-full"
                >
                  ⚠ {error}
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <motion.button
                  onClick={canSkip ? skipAnimation : openBox}
                  disabled={
                    canSkip
                      ? false
                      : isOpening || !canOpen
                  }
                  className={`pixel-btn w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-4 ${
                    canSkip
                      ? "border-2 border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-400"
                      : !canOpen || (isOpening && !canSkip)
                      ? "opacity-40 cursor-not-allowed border-gray-700 text-gray-500 bg-gray-900"
                      : "pixel-btn-primary"
                  }`}
                  whileHover={
                    (canSkip || (canOpen && !isOpening)) ? { scale: 1.05 } : {}
                  }
                  whileTap={
                    (canSkip || (canOpen && !isOpening)) ? { scale: 0.95 } : {}
                  }
                >
                  {canSkip
                    ? "⏭ 스킵"
                    : isOpening && isBatchOpening
                    ? "10개 오픈 중..."
                    : isOpening && !isBatchOpening
                    ? "오픈 중..."
                    : !canOpen
                    ? "토큰 없음"
                    : isAdmin
                    ? "🎲 박스 열기"
                    : "🎲 박스 열기 (-1🎫)"}
                </motion.button>

                {!isOpening && (
                <motion.button
                  onClick={openBoxTen}
                  disabled={!canOpenTen}
                  className={`pixel-btn w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-4 ${
                    !canOpenTen
                      ? "opacity-40 cursor-not-allowed border-gray-700 text-gray-500 bg-gray-900"
                      : "border-2 border-indigo-400 bg-indigo-950 text-indigo-200 hover:brightness-110"
                  }`}
                  whileHover={canOpenTen ? { scale: 1.05 } : {}}
                  whileTap={canOpenTen ? { scale: 0.95 } : {}}
                >
                  {!canOpenTen
                    ? "토큰 10개 필요"
                    : isAdmin
                    ? "🎲 박스 열기 x10"
                    : "🎲 박스 열기 x10 (-10🎫)"}
                </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                x:
                  singleResult && getGradeTier(singleResult.grade) >= 3
                    ? [0, -4, 4, -3, 3, 0]
                    : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                x: { duration: 0.5, delay: 0.1 },
              }}
              className="flex flex-col items-center gap-6 relative z-50"
            >
              {isBatchResult ? (
                <BatchResults results={displayResults} />
              ) : (
                <>
                  {singleResult && hasRevealEffect(singleResult.grade) && (
                    <GradeRevealEffects grade={singleResult.grade} />
                  )}
                  {gradeInfo && singleResult && (
                    <ResultCard
                      grade={singleResult.grade}
                      points={singleResult.points}
                    />
                  )}
                </>
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
