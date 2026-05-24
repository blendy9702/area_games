"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { GameProfile } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";

interface NavBarProps {
  profile: GameProfile | null;
  isAdmin: boolean;
}

export default function NavBar({ profile, isAdmin }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    { href: "/game", label: "🎲", labelFull: "🎲 GAME" },
    { href: "/history", label: "📜", labelFull: "📜 HISTORY" },
    ...(isAdmin
      ? [{ href: "/admin", label: "👑", labelFull: "👑 ADMIN" }]
      : []),
  ];

  return (
    <nav className="border-b-4 border-indigo-900 bg-[#0d0d1a] safe-area-x pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:pb-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-indigo-400 text-[10px] sm:text-xs pixel-glow shrink-0">
            🎲
          </span>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[8px] px-2 py-1.5 min-h-[36px] flex items-center border-2 transition-colors ${
                  pathname === item.href
                    ? "border-indigo-400 bg-indigo-900 text-indigo-200"
                    : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="sm:hidden">{item.label}</span>
                <span className="hidden sm:inline">{item.labelFull}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {profile && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[8px] text-gray-500 hidden md:block max-w-[80px] truncate">
                {profile.username}
              </span>
              <div className="flex items-center gap-1 border-2 border-yellow-700 bg-yellow-950 px-1.5 sm:px-2 py-1 token-shine">
                <span className="text-[10px]">🎫</span>
                <span className="text-[10px] sm:text-xs text-yellow-300">
                  {formatTokens(profile.tokens, isAdmin)}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="pixel-btn pixel-btn-danger text-[8px] px-2 py-1 min-h-[36px]"
          >
            <span className="sm:hidden">OUT</span>
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
