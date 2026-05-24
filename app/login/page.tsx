"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PixelBackground from "@/components/PixelBackground";
import {
  normalizeUsername,
  isValidPinCode,
  pinCodeValidationError,
} from "@/lib/auth/username";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedName = normalizeUsername(username);

    if (!normalizedName) {
      setError("\uC774\uB984\uACFC \uACE0\uC720\uBC88\uD638 \uC55E\uC790\uB9AC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      setLoading(false);
      return;
    }

    if (!isValidPinCode(pinCode)) {
      setError(pinCodeValidationError());
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: normalizedName,
        password: pinCode,
        rememberMe,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(
        data.error ||
          "\uC774\uB984 \uB610\uB294 \uACE0\uC720\uBC88\uD638 \uC55E\uC790\uB9AC\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
      );
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
          <div className="text-xl sm:text-2xl text-indigo-400 pixel-glow mb-2">
            {"\uD83C\uDFB2 \uC5D0\uB9AC\uC544 \uAC8C\uC784\uC988"}
          </div>
          <div className="text-sm text-gray-500 tracking-widest">
            {"\uB79C\uB364\uBC15\uC2A4"}
          </div>
        </div>

        <div className="pixel-card">
          <div className="text-base text-indigo-300 mb-6 text-center border-b border-indigo-900 pb-4">
            {"\u25B6 \uB85C\uADF8\uC778"}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {"\uC774\uB984"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pixel-input"
                placeholder={"\uC774\uB984 \uC785\uB825"}
                autoComplete="username"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {"\uACE0\uC720\uBC88\uD638 \uC55E\uC790\uB9AC"}
              </label>
              <input
                type="password"
                value={pinCode}
                onChange={(e) =>
                  setPinCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                className="pixel-input"
                placeholder="00000000"
                autoComplete="current-password"
                inputMode="numeric"
                pattern="\d{8}"
                minLength={8}
                maxLength={8}
                required
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-indigo-500"
              />
              <span className="text-sm text-gray-400">
                {"\uB85C\uADF8\uC778 \uC0C1\uD0DC \uC720\uC9C0"}
              </span>
            </label>

            {error && (
              <div className="text-red-400 text-sm border border-red-800 bg-red-950 p-3">
                {"\u26A0 "}
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="pixel-btn pixel-btn-primary w-full mt-2"
            >
              {loading ? "\uC7A0\uC2DC\uB9CC..." : "\u25B6 \uB85C\uADF8\uC778"}
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-gray-800">
            <span className="text-sm text-gray-600">
              {"\uACC4\uC815\uC774 \uC5C6\uC73C\uC2E0\uAC00\uC694? "}
            </span>
            <Link
              href="/signup"
              className="text-sm text-indigo-400 hover:text-indigo-300 underline"
            >
              {"\uD68C\uC6D0\uAC00\uC785"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
