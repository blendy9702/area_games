"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PixelBackground from "@/components/PixelBackground";
import {
  normalizeUsername,
  isValidUsername,
  usernameValidationError,
  isValidPinCode,
  pinCodeValidationError,
} from "@/lib/auth/username";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedName = normalizeUsername(username);

    if (!isValidUsername(normalizedName)) {
      setError(usernameValidationError());
      setLoading(false);
      return;
    }

    if (!isValidPinCode(pinCode)) {
      setError(pinCodeValidationError());
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: normalizedName, password: pinCode }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "\uD68C\uC6D0\uAC00\uC785\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
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
          <div className="text-2xl mb-4">{"\uD83C\uDF89"}</div>
          <div className="text-sm text-green-400 mb-2">
            {"\uD68C\uC6D0\uAC00\uC785 \uC644\uB8CC!"}
          </div>
          <div className="text-sm text-gray-500">
            {"\uB85C\uADF8\uC778 \uD398\uC774\uC9C0\uB85C \uC774\uB3D9..."}
          </div>
        </div>
      </div>
    );
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
            {"\uC0C8 \uD50C\uB808\uC774\uC5B4"}
          </div>
        </div>

        <div className="pixel-card">
          <div className="text-base text-green-300 mb-6 text-center border-b border-green-900 pb-4">
            {"\u25B6 \uD68C\uC6D0\uAC00\uC785"}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {"\uC774\uB984"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pixel-input"
                placeholder={"\uD55C\uAE00 \uB610\uB294 \uC601\uBB38 (2~12\uC790)"}
                maxLength={12}
                autoComplete="username"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              <div className="text-xs text-gray-600 mt-1">
                {"\uD55C\uAE00, \uC601\uBB38, \uC22B\uC790, _ \uC0AC\uC6A9 \uAC00\uB2A5"}
              </div>
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
                minLength={8}
                maxLength={8}
                inputMode="numeric"
                pattern="\d{8}"
                autoComplete="new-password"
                required
              />
              <div className="text-xs text-gray-600 mt-1">
                {"8\uC790\uB9AC \uC22B\uC790\uB9CC \uC785\uB825 \uAC00\uB2A5"}
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm border border-red-800 bg-red-950 p-3">
                {"\u26A0 "}
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="pixel-btn pixel-btn-success w-full mt-2"
            >
              {loading ? "\uC7A0\uC2DC\uB9CC..." : "\u25B6 \uAC00\uC785\uD558\uAE30"}
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-gray-800">
            <span className="text-sm text-gray-600">
              {"\uC774\uBBF8 \uACC4\uC815\uC774 \uC788\uC73C\uC2E0\uAC00\uC694? "}
            </span>
            <Link
              href="/login"
              className="text-sm text-indigo-400 hover:text-indigo-300 underline"
            >
              {"\uB85C\uADF8\uC778"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
