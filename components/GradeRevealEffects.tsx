"use client";

import { motion } from "framer-motion";
import { GRADE_INFO, type Grade } from "@/lib/types";
import { getGradeTier } from "@/lib/grades";

interface GradeRevealEffectsProps {
  grade: Grade;
}

const TIER_COLORS: Record<number, string[]> = {
  1: ["#a855f7", "#c084fc", "#7c3aed"],
  2: ["#fffbeb", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#fef08a"],
  3: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"],
  4: ["#ffffff", "#00ffff", "#ff00ff", "#888888", "#000000"],
};

const LEGENDARY_GOLDS = ["#fffbeb", "#fef08a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706"];

const MYTHIC_RAINBOW = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#f43f5e",
];

const EPIC_PURPLES = ["#f3e8ff", "#e9d5ff", "#c084fc", "#a855f7", "#7c3aed", "#6d28d9"];

export default function GradeRevealEffects({ grade }: GradeRevealEffectsProps) {
  const tier = getGradeTier(grade);
  if (tier < 1) return null;

  const isEpic = grade === "epic";
  const isLegendary = grade === "legendary";
  const isMythic = grade === "mythic";
  const colors = TIER_COLORS[tier] ?? TIER_COLORS[1];
  const particleCount = isMythic
    ? 40
    : isLegendary
    ? 28
    : isEpic
    ? 16
    : tier === 1
    ? 10
    : tier === 2
    ? 18
    : tier === 3
    ? 28
    : 36;
  const info = GRADE_INFO[grade];

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* 등급별 전체 화면 플래시 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: isMythic
            ? "radial-gradient(circle, rgba(239,68,68,0.5) 0%, rgba(249,115,22,0.35) 25%, rgba(59,130,246,0.25) 45%, rgba(168,85,247,0.15) 60%, transparent 75%)"
            : isLegendary
            ? "radial-gradient(circle, rgba(254,240,138,0.55) 0%, rgba(251,191,36,0.35) 35%, rgba(245,158,11,0.15) 55%, transparent 72%)"
            : isEpic
            ? "radial-gradient(circle, rgba(192,132,252,0.4) 0%, rgba(168,85,247,0.28) 40%, rgba(124,58,237,0.12) 58%, transparent 72%)"
            : tier === 4
            ? "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)"
            : tier === 3
            ? "radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 65%)"
            : tier === 2
            ? "radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 65%)",
        }}
        initial={{ opacity: 0, scale: isMythic ? 0.4 : isLegendary ? 0.6 : isEpic ? 0.75 : 1 }}
        animate={
          isMythic
            ? { opacity: [0, 1, 0.85, 0.5, 0.2, 0], scale: [0.4, 1.5, 1.8, 2.2, 2.6, 3] }
            : isLegendary
            ? { opacity: [0, 1, 0.7, 0.35, 0], scale: [0.6, 1.3, 1.6, 1.8, 2] }
            : isEpic
            ? { opacity: [0, 0.95, 0.55, 0.25, 0], scale: [0.75, 1.2, 1.45, 1.6, 1.8] }
            : { opacity: [0, 0.9, 0.4, 0] }
        }
        transition={{ duration: isMythic ? 2 : isLegendary ? 1.6 : isEpic ? 1.1 : tier >= 3 ? 1.2 : 0.8, ease: "easeOut" }}
      />

      {/* Epic: 보라 섬광 + 링 */}
      {isEpic && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(110deg, transparent 38%, rgba(233,213,255,0.35) 48%, rgba(168,85,247,0.45) 50%, rgba(233,213,255,0.35) 52%, transparent 62%)",
            }}
            animate={{ x: ["-110%", "210%"] }}
            transition={{ duration: 1, repeat: 1, ease: "easeInOut", delay: 0.1 }}
          />
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ep-ring-${i}`}
              className="absolute top-1/2 left-1/2 rounded-full border-2"
              style={{
                borderColor: EPIC_PURPLES[i % EPIC_PURPLES.length],
                boxShadow: `0 0 ${16 + i * 6}px rgba(168,85,247,0.55)`,
                width: 110 + i * 65,
                height: 110 + i * 65,
                marginLeft: -(55 + i * 32.5),
                marginTop: -(55 + i * 32.5),
              }}
              initial={{ scale: 0.35, opacity: 0.9 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
            />
          ))}
        </>
      )}

      {/* Epic: 8방향 보라 광선 */}
      {isEpic &&
        Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`ep-ray-${i}`}
            className="absolute top-1/2 left-1/2 origin-left h-0.5 sm:h-1"
            style={{
              width: 140,
              background: `linear-gradient(90deg, ${EPIC_PURPLES[i % EPIC_PURPLES.length]}, transparent)`,
              rotate: `${(360 / 8) * i}deg`,
              boxShadow: `0 0 8px ${EPIC_PURPLES[i % EPIC_PURPLES.length]}`,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: [0, 0.9, 0], scaleX: [0, 1, 0.4] }}
            transition={{
              duration: 0.85,
              delay: 0.08 + i * 0.04,
              ease: "easeOut",
            }}
          />
        ))}

      {/* Mythic: 무지개 섬광 + 크로매틱 수차 */}
      {isMythic && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(239,68,68,0.4) 42%, rgba(234,179,8,0.5) 48%, rgba(59,130,246,0.5) 52%, rgba(168,85,247,0.4) 58%, transparent 70%)",
            }}
            animate={{ x: ["-130%", "230%"] }}
            transition={{ duration: 0.9, repeat: 3, ease: "easeInOut", delay: 0.1 }}
          />
          <motion.div
            className="absolute inset-0 mix-blend-screen"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(239,68,68,0.2) 30%, transparent 65%)",
            }}
            animate={{
              opacity: [0, 1, 0.6, 1, 0.4, 0],
              scale: [0.5, 1.6, 1.2, 1.8, 1.4, 2],
            }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,0,0,0.15) 0%, transparent 33%, rgba(0,255,0,0.12) 50%, transparent 66%, rgba(0,0,255,0.15) 100%)",
            }}
            animate={{
              x: [-12, 12, -8, 10, -6, 8, 0],
              opacity: [0.3, 0.8, 0.5, 0.9, 0.4, 0.7, 0],
            }}
            transition={{ duration: 0.2, repeat: 8 }}
          />
          {/* 이중 무지개 링 폭발 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={`my-ring-${i}`}
              className="absolute top-1/2 left-1/2 rounded-full"
              style={{
                borderWidth: 3,
                borderStyle: "solid",
                borderColor: MYTHIC_RAINBOW[i % MYTHIC_RAINBOW.length],
                boxShadow: `0 0 ${24 + i * 10}px ${MYTHIC_RAINBOW[i % MYTHIC_RAINBOW.length]}88`,
                width: 100 + i * 70,
                height: 100 + i * 70,
                marginLeft: -(50 + i * 35),
                marginTop: -(50 + i * 35),
              }}
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 3.8, opacity: 0 }}
              transition={{ duration: 1.2, delay: i * 0.08, ease: "easeOut" }}
            />
          ))}
        </>
      )}

      {/* Legendary: 황금 섬광 스weep */}
      {isLegendary && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(110deg, transparent 35%, rgba(255,251,235,0.5) 48%, rgba(251,191,36,0.65) 50%, rgba(255,251,235,0.5) 52%, transparent 65%)",
            }}
            animate={{ x: ["-120%", "220%"] }}
            transition={{ duration: 1.1, repeat: 2, ease: "easeInOut", delay: 0.15 }}
          />
          <motion.div
            className="absolute inset-0 mix-blend-screen"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,215,0,0.35) 0%, transparent 60%)",
            }}
            animate={{ opacity: [0, 0.9, 0.5, 0.8, 0], scale: [0.8, 1.4, 1.1, 1.5, 1.2] }}
            transition={{ duration: 1.8, ease: "easeOut" }}
          />
        </>
      )}

      {/* Epic+: 링 펄스 */}
      {tier >= 1 && (
        <>
          {[0, 1, isEpic || isLegendary || tier >= 2 ? 2 : null, isLegendary ? 3 : null, isMythic ? 4 : null]
            .filter((v) => v !== null)
            .map((i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute top-1/2 left-1/2 rounded-full"
                style={{
                  borderWidth: isLegendary || isMythic ? 3 : 2,
                  borderStyle: "solid",
                  borderColor: isLegendary
                    ? LEGENDARY_GOLDS[(i as number) % LEGENDARY_GOLDS.length]
                    : isEpic
                    ? EPIC_PURPLES[(i as number) % EPIC_PURPLES.length]
                    : isMythic
                    ? MYTHIC_RAINBOW[(i as number) % MYTHIC_RAINBOW.length]
                    : info.color,
                  boxShadow: isLegendary
                    ? `0 0 ${20 + (i as number) * 8}px rgba(251,191,36,0.6)`
                    : isEpic
                    ? `0 0 ${14 + (i as number) * 5}px rgba(168,85,247,0.5)`
                    : isMythic
                    ? `0 0 ${24 + (i as number) * 10}px ${MYTHIC_RAINBOW[(i as number) % MYTHIC_RAINBOW.length]}99`
                    : undefined,
                  width: 120 + (i as number) * 80,
                  height: 120 + (i as number) * 80,
                  marginLeft: -(60 + (i as number) * 40),
                  marginTop: -(60 + (i as number) * 40),
                }}
                initial={{ scale: 0.3, opacity: isLegendary || isMythic || isEpic ? 1 : 0.8 }}
                animate={{
                  scale: isMythic ? 4 : isLegendary ? 3.2 : isEpic ? 2.6 : tier >= 3 ? 3.5 : tier >= 2 ? 2.8 : 2.2,
                  opacity: 0,
                }}
                transition={{
                  duration: isMythic ? 1.1 : isLegendary ? 1.3 : isEpic ? 1 : tier >= 3 ? 1.4 : 1,
                  delay: (i as number) * (isMythic ? 0.08 : isEpic ? 0.1 : 0.12),
                  ease: "easeOut",
                }}
              />
            ))}
        </>
      )}

      {/* Mythic: 20방향 무지개 광선 */}
      {isMythic &&
        Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`my-ray-${i}`}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: 220,
              height: i % 3 === 0 ? 5 : i % 2 === 0 ? 3 : 2,
              background: `linear-gradient(90deg, ${MYTHIC_RAINBOW[i % MYTHIC_RAINBOW.length]}, rgba(255,255,255,0.6) 30%, transparent 70%)`,
              rotate: `${(360 / 20) * i}deg`,
              boxShadow: `0 0 16px ${MYTHIC_RAINBOW[i % MYTHIC_RAINBOW.length]}`,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: [0, 1, 0.8, 0], scaleX: [0, 1.4, 1, 0] }}
            transition={{
              duration: 1.2,
              delay: 0.03 + i * 0.02,
              ease: "easeOut",
            }}
          />
        ))}

      {/* Legendary: 황금 광선 (16방향) */}
      {isLegendary &&
        Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={`lg-ray-${i}`}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: 200,
              height: i % 2 === 0 ? 4 : 2,
              background: `linear-gradient(90deg, ${LEGENDARY_GOLDS[i % LEGENDARY_GOLDS.length]}, rgba(251,191,36,0.4) 60%, transparent)`,
              rotate: `${(360 / 16) * i}deg`,
              boxShadow: `0 0 12px ${LEGENDARY_GOLDS[i % LEGENDARY_GOLDS.length]}`,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: [0, 1, 0.6, 0], scaleX: [0, 1.2, 0.8, 0] }}
            transition={{
              duration: 1.1,
              delay: 0.05 + i * 0.025,
              ease: "easeOut",
            }}
          />
        ))}

      {/* Legendary+: 광선 (시크릿만 — 신화는 전용 광선) */}
      {tier >= 2 && !isLegendary && !isMythic &&
        Array.from({ length: tier >= 3 ? 12 : 8 }).map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute top-1/2 left-1/2 origin-left h-0.5 sm:h-1"
            style={{
              width: tier >= 4 ? 180 : tier >= 3 ? 160 : 120,
              background: `linear-gradient(90deg, ${colors[i % colors.length]}, transparent)`,
              rotate: `${(360 / (tier >= 3 ? 12 : 8)) * i}deg`,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0.5] }}
            transition={{
              duration: tier >= 3 ? 1 : 0.7,
              delay: 0.1 + i * 0.03,
              ease: "easeOut",
            }}
          />
        ))}

      {/* Mythic: 폭발 스파크 */}
      {isMythic &&
        Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`my-spark-${i}`}
            className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5"
            style={{
              backgroundColor: MYTHIC_RAINBOW[i % MYTHIC_RAINBOW.length],
              left: "50%",
              top: "50%",
              boxShadow: `0 0 10px ${MYTHIC_RAINBOW[i % MYTHIC_RAINBOW.length]}, 0 0 20px rgba(255,255,255,0.4)`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((i / 30) * Math.PI * 2) * (180 + (i % 4) * 20),
              y: Math.sin((i / 30) * Math.PI * 2) * (180 + (i % 4) * 20),
              opacity: 0,
              scale: [1, 2.5, 0],
            }}
            transition={{
              duration: 1,
              delay: i * 0.015,
              ease: "easeOut",
            }}
          />
        ))}

      {/* Legendary: 떨어지는 금색 파티클 */}
      {isLegendary &&
        Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={`lg-fall-${i}`}
            className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2"
            style={{
              backgroundColor: LEGENDARY_GOLDS[i % LEGENDARY_GOLDS.length],
              left: `${8 + ((i * 17) % 84)}%`,
              top: "-5%",
              boxShadow: `0 0 8px ${LEGENDARY_GOLDS[i % LEGENDARY_GOLDS.length]}`,
            }}
            initial={{ opacity: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [0, 120 + (i % 5) * 40, 280 + (i % 3) * 60],
              rotate: [0, 180, 360],
              scale: [0.5, 1.2, 0.8],
            }}
            transition={{
              duration: 1.4 + (i % 4) * 0.2,
              delay: i * 0.04,
              ease: "easeIn",
            }}
          />
        ))}

      {/* Mythic+: 화면 섬광 (신화는 더 강하게) */}
      {tier >= 3 && !isMythic && (
        <motion.div
          className="absolute inset-0 mix-blend-screen"
          style={{
            background:
              "linear-gradient(45deg, rgba(239,68,68,0.1), rgba(59,130,246,0.1), rgba(234,179,8,0.1))",
          }}
          animate={{ opacity: [0, 0.6, 0, 0.4, 0] }}
          transition={{ duration: 1.5, repeat: tier >= 4 ? 2 : 1 }}
        />
      )}

      {isMythic && (
        <motion.div
          className="absolute inset-0 mix-blend-screen"
          style={{
            background:
              "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(234,179,8,0.2), rgba(59,130,246,0.25), rgba(168,85,247,0.2))",
          }}
          animate={{ opacity: [0, 0.9, 0.3, 0.8, 0.2, 0.6, 0] }}
          transition={{ duration: 2, repeat: 1 }}
        />
      )}

      {/* Secret: 글리치 스캔라인 + 화면 왜곡 */}
      {tier >= 4 && (
        <>
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.12) 2px, rgba(255,255,255,0.12) 4px)",
            }}
            animate={{ y: [0, 24, -12, 18, 0], opacity: [0.2, 0.5, 0.3, 0.45, 0.2] }}
            transition={{ duration: 0.25, repeat: 10 }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,0,0,0.12), rgba(0,255,255,0.12))",
            }}
            animate={{
              x: [-8, 8, -6, 10, -4, 6, 0],
              scale: [1, 1.04, 0.96, 1.06, 0.94, 1.02, 1],
            }}
            transition={{ duration: 0.18, repeat: 14 }}
          />
          <motion.div
            className="absolute inset-0 mix-blend-difference pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 55%)",
            }}
            animate={{
              scale: [0.8, 2.2, 0.5, 1.8, 1],
              opacity: [0, 0.7, 0.3, 0.5, 0],
            }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          />
        </>
      )}

      {/* 파티클 */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className={
            tier >= 4 || isLegendary || isMythic || isEpic
              ? "absolute w-1.5 h-1.5 sm:w-2 sm:h-2"
              : "absolute w-1 h-1 sm:w-1.5 sm:h-1.5"
          }
          style={{
            backgroundColor: colors[i % colors.length],
            left: "50%",
            top: "50%",
            boxShadow: isMythic
              ? `0 0 12px ${colors[i % colors.length]}, 0 0 24px rgba(255,255,255,0.3)`
              : isLegendary
              ? `0 0 10px ${colors[i % colors.length]}, 0 0 20px rgba(251,191,36,0.5)`
              : isEpic
              ? `0 0 8px ${colors[i % colors.length]}, 0 0 16px rgba(168,85,247,0.45)`
              : tier >= 2
              ? `0 0 6px ${colors[i % colors.length]}`
              : undefined,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x:
              Math.cos((i / particleCount) * Math.PI * 2) *
              (isMythic ? 190 : isLegendary ? 150 : isEpic ? 110 : tier >= 3 ? 160 : tier >= 2 ? 120 : 90),
            y:
              Math.sin((i / particleCount) * Math.PI * 2) *
              (isMythic ? 190 : isLegendary ? 150 : isEpic ? 110 : tier >= 3 ? 160 : tier >= 2 ? 120 : 90),
            opacity: 0,
            scale: isMythic ? [1, 2.8, 0] : isLegendary ? [1, 2.2, 0] : isEpic ? [1, 1.8, 0] : tier >= 3 ? [1, 2, 0] : [1, 1.5, 0],
          }}
          transition={{
            duration: isMythic ? 1 : isLegendary ? 1.1 : isEpic ? 0.95 : tier >= 3 ? 1.2 : 0.9,
            delay: i * 0.02,
            ease: "easeOut",
          }}
        />
      ))}

      {/* 등급 라벨 버스트 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={
          tier >= 4
            ? {
                opacity: [0, 1, 1, 0.85, 0],
                scale: [0.2, 2.5, 0.65, 1.6, 1.2],
              }
            : isLegendary
            ? {
                opacity: [0, 1, 1, 0.6, 0],
                scale: [0.3, 1.9, 1.1, 1.5, 1.3],
              }
            : isMythic
            ? {
                opacity: [0, 1, 1, 0.8, 0.5, 0],
                scale: [0.2, 2.2, 0.9, 1.8, 1.4, 1.5],
              }
            : isEpic
            ? {
                opacity: [0, 1, 0.7, 0],
                scale: [0.35, 1.45, 1.15, 1.3],
              }
            : {
                opacity: [0, 1, 0],
                scale: [0.5, tier >= 3 ? 1.8 : 1.4, 1.6],
              }
        }
        transition={
          tier >= 4
            ? { duration: 1.8, ease: [0.15, 0.85, 0.25, 1], times: [0, 0.2, 0.28, 0.45, 1] }
            : isLegendary
            ? { duration: 1.5, ease: [0.2, 0.9, 0.3, 1], times: [0, 0.2, 0.4, 0.7, 1] }
            : isMythic
            ? { duration: 1.8, ease: [0.15, 0.85, 0.25, 1], times: [0, 0.15, 0.3, 0.5, 0.75, 1] }
            : isEpic
            ? { duration: 1, ease: "easeOut", times: [0, 0.25, 0.6, 1] }
            : { duration: tier >= 3 ? 1.2 : 0.9, ease: "easeOut" }
        }
      >
        <span
          className={`text-lg sm:text-2xl font-bold ${
            tier >= 4
              ? "glitch-effect glitch-effect-burst text-white"
              : isMythic
              ? "rainbow-text-intense mythic-glow"
              : isLegendary
              ? "golden-text legendary-glow"
              : isEpic
              ? "epic-text epic-glow"
              : tier >= 3
              ? "rainbow-text"
              : info.textColor
          }`}
          data-text={info.label}
          style={undefined}
        >
          {info.label}
        </span>
      </motion.div>
    </div>
  );
}
