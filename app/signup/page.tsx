"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PixelBackground from "@/components/PixelBackground";
import {
  IDENTITY_FIELD_LABEL,
  PIN_FIELD_LABEL,
  normalizeUsername,
  isValidUsername,
  usernameValidationError,
  identityPlaceholder,
  identityHint,
  isValidPinCode,
  pinCodeValidationError,
  pinCodeHint,
} from "@/lib/auth/username";
import { showValidationToast } from "@/lib/pixel-toast";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const normalizedIdentity = normalizeUsername(username);

    if (!isValidUsername(normalizedIdentity)) {
      showValidationToast(usernameValidationError());
      setLoading(false);
      return;
    }

    if (!isValidPinCode(pinCode)) {
      showValidationToast(pinCodeValidationError());
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: normalizedIdentity, password: pinCode }),
    });

    const data = await res.json();

    if (!res.ok) {
      showValidationToast(data.error || "\uD68C\uC6D0\uAC00\uC785\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
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
                {IDENTITY_FIELD_LABEL}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pixel-input"
                placeholder={identityPlaceholder()}
                maxLength={12}
                autoComplete="username"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              <div className="text-xs text-gray-600 mt-1">{identityHint()}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {PIN_FIELD_LABEL}
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
              <div className="text-xs text-gray-600 mt-1">{pinCodeHint()}</div>
            </div>

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
