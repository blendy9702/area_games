"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PixelBackground from "@/components/PixelBackground";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = `${username.trim().toLowerCase()}@area-games.com`;
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
    } else {
      router.push("/game");
      router.refresh();
    }
  }

  return (
    <div className="auth-page flex items-center justify-center relative overflow-hidden">
      <PixelBackground />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-lg sm:text-2xl text-indigo-400 pixel-glow mb-2">🎲 에리아 게임즈</div>
          <div className="text-xs text-gray-500 tracking-widest">랜덤박스</div>
        </div>

        <div className="pixel-card">
          <div className="text-sm text-indigo-300 mb-6 text-center border-b border-indigo-900 pb-4">
            ▶ 로그인
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">아이디</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pixel-input"
                placeholder="아이디 입력"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pixel-input"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs border border-red-800 bg-red-950 p-3">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="pixel-btn pixel-btn-primary w-full mt-2"
            >
              {loading ? "잠시만..." : "▶ 로그인"}
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-gray-800">
            <span className="text-xs text-gray-600">계정이 없으신가요? </span>
            <Link href="/signup" className="text-xs text-indigo-400 hover:text-indigo-300 underline">
              회원가입
            </Link>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {["⬛", "🟫", "🟦", "🟪", "🟨", "🟥"].map((emoji, i) => (
            <span key={i} className="text-xs opacity-40">{emoji}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
