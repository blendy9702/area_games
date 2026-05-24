"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PixelBackground from "@/components/PixelBackground";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmed = username.trim().toLowerCase();

    if (trimmed.length < 2 || trimmed.length > 12) {
      setError("아이디는 2~12자로 입력해주세요.");
      setLoading(false);
      return;
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      setError("아이디는 영문 소문자, 숫자, _ 만 사용 가능합니다.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: trimmed, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "회원가입에 실패했습니다.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (success) {
    return (
      <div className="auth-page flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center pixel-card max-w-sm">
          <div className="text-2xl mb-4">🎉</div>
          <div className="text-sm text-green-400 mb-2">회원가입 완료!</div>
          <div className="text-xs text-gray-500">로그인 페이지로 이동...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page flex items-center justify-center relative overflow-hidden">
      <PixelBackground />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-lg sm:text-2xl text-indigo-400 pixel-glow mb-2">
            🎲 에리아 게임즈
          </div>
          <div className="text-xs text-gray-500 tracking-widest">새 플레이어</div>
        </div>

        <div className="pixel-card">
          <div className="text-sm text-green-300 mb-6 text-center border-b border-green-900 pb-4">
            ▶ 회원가입
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">아이디</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pixel-input"
                placeholder="영문/숫자/_ (2~12자)"
                maxLength={12}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                required
              />
              <div className="text-[8px] text-gray-600 mt-1">
                영문 소문자, 숫자, _ 사용 가능
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pixel-input"
                placeholder="6자 이상"
                minLength={6}
                autoComplete="new-password"
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
              className="pixel-btn pixel-btn-success w-full mt-2"
            >
              {loading ? "잠시만..." : "▶ 가입하기"}
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-gray-800">
            <span className="text-xs text-gray-600">이미 계정이 있으신가요? </span>
            <Link
              href="/login"
              className="text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
