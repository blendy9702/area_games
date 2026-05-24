"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { GRADE_INFO, type Grade, type GameProfile } from "@/lib/types";
import { formatTokens, hasTokens } from "@/lib/tokens";
import BoxOpenAnimation from "./BoxOpenAnimation";

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
  const [result, setResult] = useState<{ grade: Grade; points: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");

  const openBox = useCallback(async () => {
    if (!hasTokens(profile.tokens, isAdmin)) {
      setError("토큰이 부족합니다! 어드민에게 토큰을 요청하세요.");
      return;
    }
    if (isOpening) return;

    setError("");
    setIsOpening(true);
    setShowResult(false);
    setResult(null);

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("open_game_box", {
      p_user_id: userId,
    });

    if (rpcError) {
      setError(rpcError.message);
      setIsOpening(false);
      return;
    }

    const boxResult = data as { grade: Grade; points: number };
    setResult(boxResult);

    // DB에서 이미 차감됨 → NavBar 포함 즉시 반영
    setProfile((prev) => ({
      ...prev,
      tokens: isAdmin ? prev.tokens : prev.tokens - 1,
      total_boxes_opened: prev.total_boxes_opened + 1,
    }));

    setTimeout(() => {
      setShowResult(true);
      setIsOpening(false);
    }, 5200);
  }, [profile.tokens, isOpening, userId, isAdmin, setProfile]);

  const resetGame = () => {
    setShowResult(false);
    setResult(null);
  };

  const gradeInfo = result ? GRADE_INFO[result.grade] : null;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-8 w-full">
      {/* 헤더 */}
      <div className="text-center w-full">
        <h1 className="text-sm sm:text-lg text-indigo-300 pixel-glow mb-2">
          🎲 RANDOM BOX
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 text-[10px] sm:text-xs text-gray-400">
          <span>
            PLAYER:{" "}
            <span className="text-indigo-300">{profile.username}</span>
          </span>
          <span>
            BOXES:{" "}
            <span className="text-green-300">{profile.total_boxes_opened}</span>
          </span>
        </div>
      </div>

      {/* 토큰 표시 */}
      <div className="flex items-center gap-3 pixel-card px-5 sm:px-8 py-3 sm:py-4 w-full max-w-xs sm:max-w-none sm:w-auto justify-center">
        <span className="text-2xl token-shine">🎫</span>
        <div>
          <div className="text-xs text-gray-500 mb-1">TOKENS</div>
          <div className="text-xl sm:text-2xl text-yellow-300">
            {formatTokens(profile.tokens, isAdmin)}
          </div>
        </div>
      </div>

      {/* 박스 오픈 영역 */}
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
              <BoxOpenAnimation
                isOpening={isOpening}
                result={result}
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-xs border border-red-800 bg-red-950 p-3 text-center w-full"
                >
                  ⚠ {error}
                </motion.div>
              )}

              <motion.button
                onClick={openBox}
                disabled={isOpening || !hasTokens(profile.tokens, isAdmin)}
                className={`pixel-btn w-full sm:w-auto text-xs sm:text-sm px-6 sm:px-8 py-4 ${
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
                  ? "OPENING..."
                  : !hasTokens(profile.tokens, isAdmin)
                  ? "NO TOKENS"
                  : isAdmin
                  ? "🎲 OPEN BOX"
                  : "🎲 OPEN BOX (-1🎫)"}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex flex-col items-center gap-6"
            >
              {gradeInfo && result && (
                <ResultCard grade={result.grade} points={result.points} />
              )}
              <button onClick={resetGame} className="pixel-btn pixel-btn-primary w-full sm:w-auto text-xs sm:text-sm px-6 py-3">
                ▶ OPEN AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 등급 정보 테이블 */}
      <div className="w-full max-w-2xl">
        <div className="text-xs text-gray-500 text-center mb-3">
          ── GRADE TABLE ──
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(GRADE_INFO) as [Grade, typeof GRADE_INFO[Grade]][]).map(
            ([grade, info]) => (
              <div
                key={grade}
                className={`pixel-card p-3 border-2 ${info.borderColor}`}
              >
                <div className={`text-[9px] font-bold mb-1 ${info.textColor}`}>
                  {grade === "mythic" ? (
                    <span className="rainbow-text">{info.label}</span>
                  ) : grade === "secret" ? (
                    <span className="glitch-effect" data-text={info.label}>
                      {info.label}
                    </span>
                  ) : (
                    info.label
                  )}
                </div>
                <div className="text-[8px] text-gray-400">
                  {info.points}pt · {info.probability}%
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

  const cardVariants = {
    common: "border-gray-400 bg-gray-900",
    rare: "border-blue-400 bg-blue-950",
    epic: "border-purple-400 bg-purple-950",
    legendary: "border-yellow-400 bg-yellow-950",
    mythic: "border-red-400 bg-red-950",
    secret: "border-white bg-gray-950",
  };

  return (
    <motion.div
      className={`pixel-card border-4 ${cardVariants[grade]} text-center w-full max-w-sm relative overflow-hidden p-4 sm:p-5`}
    >
      {/* 반짝임 효과 */}
      {grade === "legendary" || grade === "mythic" || grade === "secret" ? (
        <Sparkles grade={grade} />
      ) : null}

      <div className="relative z-10">
        <motion.div
          className="text-5xl mb-4"
          animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
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

        <div className={`text-sm mb-2 font-bold ${info.textColor}`}>
          {grade === "mythic" ? (
            <span className="rainbow-text pixel-glow">{info.label}</span>
          ) : grade === "secret" ? (
            <span className="glitch-effect text-white" data-text={info.label}>
              {info.label}
            </span>
          ) : (
            <span className="pixel-glow">{info.label}</span>
          )}
        </div>

        <motion.div
          className="text-xl text-yellow-300 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          +{points} POINTS
        </motion.div>

        <div className="text-[9px] text-gray-500">{info.description}</div>
      </div>
    </motion.div>
  );
}

function Sparkles({ grade }: { grade: Grade }) {
  const colors =
    grade === "secret"
      ? ["#ffffff", "#888888", "#00ffff", "#ff00ff"]
      : grade === "mythic"
      ? ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"]
      : ["#f59e0b", "#fcd34d", "#fef08a"];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.2,
            delay: i * 0.1,
            repeat: Infinity,
            repeatDelay: 0.3,
          }}
        />
      ))}
    </div>
  );
}
