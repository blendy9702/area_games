"use client";

import { motion } from "framer-motion";
import { GRADE_INFO, type Grade } from "@/lib/types";
import { getGradeTier } from "@/lib/grades";

interface GradeRevealEffectsProps {
  grade: Grade;
}

const TIER_COLORS: Record<number, string[]> = {
  1: ["#a855f7", "#c084fc", "#7c3aed"],
  2: ["#f59e0b", "#fcd34d", "#fef08a", "#fbbf24"],
  3: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"],
  4: ["#ffffff", "#00ffff", "#ff00ff", "#888888", "#000000"],
};

export default function GradeRevealEffects({ grade }: GradeRevealEffectsProps) {
  const tier = getGradeTier(grade);
  if (tier < 1) return null;

  const colors = TIER_COLORS[tier] ?? TIER_COLORS[1];
  const particleCount = tier === 1 ? 10 : tier === 2 ? 18 : tier === 3 ? 28 : 36;
  const info = GRADE_INFO[grade];

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* 등급별 전체 화면 플래시 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            tier === 4
              ? "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)"
              : tier === 3
              ? "radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 65%)"
              : tier === 2
              ? "radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 65%)"
              : "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 65%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0.4, 0] }}
        transition={{ duration: tier >= 3 ? 1.2 : 0.8, ease: "easeOut" }}
      />

      {/* Epic+: 링 펄스 */}
      {tier >= 1 && (
        <>
          {[0, 1, tier >= 2 ? 2 : null].filter((v) => v !== null).map((i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute top-1/2 left-1/2 rounded-full border-2"
              style={{
                borderColor: info.color,
                width: 120 + (i as number) * 80,
                height: 120 + (i as number) * 80,
                marginLeft: -(60 + (i as number) * 40),
                marginTop: -(60 + (i as number) * 40),
              }}
              initial={{ scale: 0.3, opacity: 0.8 }}
              animate={{ scale: tier >= 3 ? 3.5 : tier >= 2 ? 2.8 : 2.2, opacity: 0 }}
              transition={{
                duration: tier >= 3 ? 1.4 : 1,
                delay: (i as number) * 0.15,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Legendary+: 광선 */}
      {tier >= 2 &&
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

      {/* Mythic+: 화면 흔들림용 오버레이 섬광 */}
      {tier >= 3 && (
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

      {/* Secret: 글리치 스캔라인 */}
      {tier >= 4 && (
        <>
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
            }}
            animate={{ y: [0, 20, -10, 0] }}
            transition={{ duration: 0.3, repeat: 8 }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,0,0,0.08), rgba(0,255,255,0.08))",
            }}
            animate={{ x: [-4, 4, -2, 3, 0] }}
            transition={{ duration: 0.15, repeat: 12 }}
          />
        </>
      )}

      {/* 파티클 */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className={tier >= 4 ? "absolute w-1.5 h-1.5" : "absolute w-1 h-1 sm:w-1.5 sm:h-1.5"}
          style={{
            backgroundColor: colors[i % colors.length],
            left: "50%",
            top: "50%",
            boxShadow:
              tier >= 2 ? `0 0 6px ${colors[i % colors.length]}` : undefined,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((i / particleCount) * Math.PI * 2) * (tier >= 3 ? 160 : tier >= 2 ? 120 : 90),
            y: Math.sin((i / particleCount) * Math.PI * 2) * (tier >= 3 ? 160 : tier >= 2 ? 120 : 90),
            opacity: 0,
            scale: tier >= 3 ? [1, 2, 0] : [1, 1.5, 0],
          }}
          transition={{
            duration: tier >= 3 ? 1.2 : 0.9,
            delay: i * 0.02,
            ease: "easeOut",
          }}
        />
      ))}

      {/* 등급 라벨 버스트 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, tier >= 3 ? 1.8 : 1.4, 1.6] }}
        transition={{ duration: tier >= 3 ? 1.2 : 0.9, ease: "easeOut" }}
      >
        <span
          className={`text-lg sm:text-2xl font-bold ${
            tier >= 4
              ? "glitch-effect text-white"
              : tier >= 3
              ? "rainbow-text"
              : info.textColor
          }`}
          data-text={info.label}
          style={
            tier === 2
              ? { textShadow: "0 0 20px #f59e0b, 0 0 40px #fbbf24" }
              : tier === 1
              ? { textShadow: "0 0 16px #a855f7" }
              : undefined
          }
        >
          {info.label}
        </span>
      </motion.div>
    </div>
  );
}
