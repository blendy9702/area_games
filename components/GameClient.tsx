"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { GRADE_INFO, type Grade, type GameProfile } from "@/lib/types";
import { ALL_GRADES, getGradeTier, hasRevealEffect } from "@/lib/grades";
import { formatTokens, hasTokens } from "@/lib/tokens";
import BoxOpenAnimation from "./BoxOpenAnimation";
import GradeRevealEffects from "./GradeRevealEffects";

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

  const runBoxOpen = useCallback(
    async (testGrade?: Grade) => {
      const isTest = Boolean(testGrade);

      if (!isTest && !hasTokens(profile.tokens, isAdmin)) {
        setError("토큰이 부족합니다! 어드민에게 토큰을 요청하세요.");
        return;
      }
      if (isOpening) return;

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

function ResultCard({ grade, points }: { grade: Grade; points: number }) {
  const info = GRADE_INFO[grade];
  const tier = getGradeTier(grade);

  const cardVariants: Record<Grade, string> = {
    common: "border-gray-400 bg-gray-900",
    rare: "border-blue-400 bg-blue-950",
    epic: "border-purple-300 bg-gradient-to-b from-purple-950/90 to-purple-950 shadow-[0_0_28px_rgba(168,85,247,0.45)] epic-card-glow",
    legendary:
      "border-yellow-300 bg-gradient-to-b from-yellow-900/90 to-yellow-950 shadow-[0_0_40px_rgba(251,191,36,0.55)] legendary-card-glow",
    mythic:
      "border-red-300 bg-gradient-to-br from-red-950 via-purple-950 to-red-950 shadow-[0_0_48px_rgba(239,68,68,0.6)] mythic-card-glow",
    secret:
      "border-white bg-gray-950 shadow-[0_0_48px_rgba(255,255,255,0.3)]",
  };

  return (
    <motion.div
      className={`pixel-card border-4 ${cardVariants[grade]} text-center w-full max-w-sm relative overflow-hidden p-4 sm:p-5 z-50`}
      initial={grade === "secret" ? { scale: 0.85 } : undefined}
      animate={
        grade === "secret"
          ? {
              scale: [0.85, 1.18, 0.88, 1.06, 1],
              boxShadow: [
                "0 0 48px rgba(255,255,255,0.3)",
                "0 0 80px rgba(255,0,255,0.55)",
                "0 0 40px rgba(0,255,255,0.4)",
                "0 0 56px rgba(255,255,255,0.35)",
                "0 0 48px rgba(255,255,255,0.3)",
              ],
            }
          : grade === "legendary"
          ? {
              scale: [0.88, 1.14, 1],
              boxShadow: [
                "0 0 40px rgba(251,191,36,0.55)",
                "0 0 72px rgba(254,240,138,0.75)",
                "0 0 56px rgba(245,158,11,0.65)",
                "0 0 88px rgba(251,191,36,0.5)",
                "0 0 48px rgba(251,191,36,0.55)",
              ],
            }
          : grade === "mythic"
          ? {
              scale: [0.82, 1.2, 0.92, 1.1, 1],
              boxShadow: [
                "0 0 48px rgba(239,68,68,0.6)",
                "0 0 96px rgba(168,85,247,0.7)",
                "0 0 64px rgba(59,130,246,0.55)",
                "0 0 112px rgba(249,115,22,0.5)",
                "0 0 56px rgba(239,68,68,0.55)",
              ],
            }
          : grade === "epic"
          ? {
              scale: [0.9, 1.1, 1],
              boxShadow: [
                "0 0 28px rgba(168,85,247,0.5)",
                "0 0 52px rgba(192,132,252,0.65)",
                "0 0 36px rgba(124,58,237,0.45)",
                "0 0 28px rgba(168,85,247,0.5)",
              ],
            }
          : tier >= 2
          ? {
              boxShadow: [
                `0 0 ${tier >= 3 ? 40 : 24}px ${info.color}66`,
                `0 0 ${tier >= 3 ? 60 : 36}px ${info.color}99`,
                `0 0 ${tier >= 3 ? 40 : 24}px ${info.color}66`,
              ],
            }
          : undefined
      }
      transition={
        grade === "secret"
          ? { duration: 1.6, ease: [0.15, 0.85, 0.25, 1], times: [0, 0.15, 0.25, 0.4, 1] }
          : grade === "legendary"
          ? { duration: 1.4, ease: [0.2, 0.9, 0.3, 1], times: [0, 0.25, 1] }
          : grade === "mythic"
          ? { duration: 1.6, ease: [0.15, 0.85, 0.25, 1], times: [0, 0.2, 0.35, 0.55, 1] }
          : grade === "epic"
          ? { duration: 1.1, ease: [0.2, 0.9, 0.3, 1], times: [0, 0.3, 1] }
          : { duration: 1.5, repeat: tier >= 2 ? Infinity : 0, repeatType: "reverse" }
      }
    >
      {(tier >= 2 || grade === "epic") && <CardSparkles grade={grade} tier={tier} />}

      {grade === "epic" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(115deg, transparent 42%, rgba(233,213,255,0.2) 50%, transparent 58%)",
          }}
          animate={{ x: ["-140%", "240%"] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
        />
      )}

      {grade === "legendary" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(115deg, transparent 40%, rgba(255,251,235,0.25) 50%, transparent 60%)",
          }}
          animate={{ x: ["-150%", "250%"] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
        />
      )}

      {grade === "mythic" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(120deg, transparent 35%, rgba(239,68,68,0.2) 45%, rgba(234,179,8,0.25) 50%, rgba(59,130,246,0.2) 55%, transparent 65%)",
          }}
          animate={{ x: ["-160%", "260%"] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
        />
      )}

      <div className="relative z-10">
        <motion.div
          className="text-5xl mb-4"
          animate={{
            rotate:
              grade === "mythic"
                ? [0, -12, 12, -10, 10, -6, 6, 0]
                : tier >= 3
                ? [0, -8, 8, -8, 8, 0]
                : grade === "legendary"
                ? [0, -6, 6, -4, 4, 0]
                : grade === "epic"
                ? [0, -5, 5, -3, 3, 0]
                : [0, -5, 5, -5, 5, 0],
            scale:
              grade === "mythic"
                ? [1, 1.35, 0.95, 1.25, 1.05, 1.15, 1]
                : grade === "legendary"
                ? [1, 1.25, 1.05, 1.2, 1]
                : grade === "epic"
                ? [1, 1.18, 1.05, 1.12, 1]
                : tier >= 2
                ? [1, 1.15, 1]
                : 1,
            filter:
              grade === "mythic"
                ? [
                    "drop-shadow(0 0 12px #ef4444) drop-shadow(0 0 24px #3b82f6)",
                    "drop-shadow(0 0 28px #f97316) drop-shadow(0 0 56px #eab308)",
                    "drop-shadow(0 0 24px #22c55e) drop-shadow(0 0 48px #a855f7)",
                    "drop-shadow(0 0 32px #3b82f6) drop-shadow(0 0 64px #ec4899)",
                    "drop-shadow(0 0 20px #ef4444) drop-shadow(0 0 40px #f97316)",
                    "drop-shadow(0 0 16px #ef4444) drop-shadow(0 0 32px #3b82f6)",
                    "drop-shadow(0 0 12px #ef4444) drop-shadow(0 0 24px #3b82f6)",
                  ]
                : grade === "legendary"
                ? [
                    "drop-shadow(0 0 8px #fbbf24)",
                    "drop-shadow(0 0 24px #fcd34d) drop-shadow(0 0 48px #f59e0b)",
                    "drop-shadow(0 0 16px #fbbf24)",
                    "drop-shadow(0 0 32px #fef08a)",
                    "drop-shadow(0 0 12px #fbbf24)",
                  ]
                : grade === "epic"
                ? [
                    "drop-shadow(0 0 8px #a855f7)",
                    "drop-shadow(0 0 20px #c084fc) drop-shadow(0 0 36px #7c3aed)",
                    "drop-shadow(0 0 14px #a855f7)",
                    "drop-shadow(0 0 10px #a855f7)",
                  ]
                : undefined,
          }}
          transition={{
            duration:
              grade === "mythic" ? 1.4 : grade === "legendary" ? 1.2 : grade === "epic" ? 1 : tier >= 3 ? 0.7 : 0.5,
            delay: 0.2,
          }}
        >
          {grade === "secret"
            ? "⬛"
            : grade === "mythic"
            ? "🔴"
            : grade === "legendary"
            ? "🟡"
            : grade === "epic"
            ? "🟣"
            : grade === "rare"
            ? "🔵"
            : "⬜"}
        </motion.div>

        <motion.div
          className={`text-base mb-2 font-bold ${info.textColor}`}
          animate={
            grade === "secret"
              ? { scale: [0.5, 1.8, 0.7, 1.3, 1] }
              : grade === "mythic"
              ? { scale: [0.4, 1.7, 0.85, 1.35, 1] }
              : grade === "epic"
              ? { scale: [0.55, 1.25, 1] }
              : undefined
          }
          transition={
            grade === "secret"
              ? { duration: 1.4, delay: 0.15, ease: [0.15, 0.85, 0.25, 1], times: [0, 0.18, 0.28, 0.42, 1] }
              : grade === "mythic"
              ? { duration: 1.5, delay: 0.12, ease: [0.15, 0.85, 0.25, 1], times: [0, 0.2, 0.35, 0.5, 1] }
              : grade === "epic"
              ? { duration: 0.9, delay: 0.1, ease: "easeOut", times: [0, 0.35, 1] }
              : undefined
          }
        >
          {grade === "mythic" ? (
            <span className="rainbow-text-intense mythic-glow">{info.label}</span>
          ) : grade === "secret" ? (
            <span
              className="glitch-effect glitch-effect-burst text-white"
              data-text={info.label}
            >
              {info.label}
            </span>
          ) : grade === "legendary" ? (
            <span className="golden-text legendary-glow">{info.label}</span>
          ) : grade === "epic" ? (
            <span className="epic-text epic-glow">{info.label}</span>
          ) : (
            <span className={tier >= 1 ? "pixel-glow" : ""}>{info.label}</span>
          )}
        </motion.div>

        <motion.div
          className="text-xl text-yellow-300 mb-2"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: tier >= 2 || grade === "epic" ? [0.8, 1.15, 1] : 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          +{points} 포인트
        </motion.div>

        <div className="text-sm text-gray-500">{info.description}</div>
      </div>
    </motion.div>
  );
}

function CardSparkles({ grade, tier }: { grade: Grade; tier: number }) {
  const colors =
    grade === "secret"
      ? ["#ffffff", "#888888", "#00ffff", "#ff00ff"]
      : grade === "mythic"
      ? ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"]
      : grade === "legendary"
      ? ["#fffbeb", "#fef08a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#fde68a"]
      : grade === "epic"
      ? ["#f3e8ff", "#e9d5ff", "#c084fc", "#a855f7", "#7c3aed"]
      : ["#a855f7", "#c084fc", "#7c3aed"];

  const count =
    grade === "mythic" ? 32 : grade === "legendary" ? 26 : grade === "epic" ? 14 : tier === 2 ? 14 : tier === 3 ? 20 : 24;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={
            grade === "legendary" || grade === "mythic" || grade === "epic"
              ? "absolute w-1.5 h-1.5"
              : "absolute w-1 h-1"
          }
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow:
              grade === "mythic"
                ? `0 0 10px ${colors[i % colors.length]}, 0 0 20px rgba(255,255,255,0.35)`
                : grade === "legendary"
                ? `0 0 8px ${colors[i % colors.length]}, 0 0 16px rgba(251,191,36,0.4)`
                : grade === "epic"
                ? `0 0 6px ${colors[i % colors.length]}, 0 0 12px rgba(168,85,247,0.4)`
                : undefined,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [
              0,
              grade === "mythic" ? 3 : grade === "legendary" ? 2.4 : grade === "epic" ? 2 : tier >= 3 ? 2 : 1.5,
              0,
            ],
          }}
          transition={{
            duration:
              grade === "mythic" ? 0.75 : grade === "legendary" ? 0.9 : grade === "epic" ? 1 : tier >= 3 ? 1 : 1.2,
            delay: i * (grade === "mythic" ? 0.03 : grade === "legendary" ? 0.04 : grade === "epic" ? 0.05 : 0.06),
            repeat: Infinity,
            repeatDelay:
              grade === "mythic" ? 0.15 : grade === "legendary" ? 0.25 : grade === "epic" ? 0.35 : tier >= 3 ? 0.2 : 0.4,
          }}
        />
      ))}
    </div>
  );
}
