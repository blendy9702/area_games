"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { GameProfile } from "@/lib/types";

interface AdminClientProps {
  currentUserId: string;
  initialUsers: GameProfile[];
}

export default function AdminClient({
  currentUserId,
  initialUsers,
}: AdminClientProps) {
  const [users, setUsers] = useState<GameProfile[]>(initialUsers);
  const [tokenAmounts, setTokenAmounts] = useState<Record<string, number>>({});
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function giveTokens(userId: string) {
    const amount = tokenAmounts[userId] || 1;
    if (amount < 1) return;

    setLoadingUser(userId);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.rpc("admin_give_tokens", {
      p_target_user_id: userId,
      p_amount: amount,
    });

    if (error) {
      setErrorMsg(`오류: ${error.message}`);
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, tokens: u.tokens + amount } : u
        )
      );
      setSuccessUser(userId);
      setTimeout(() => setSuccessUser(null), 2000);
    }
    setLoadingUser(null);
  }

  async function deleteUser(userId: string, username: string) {
    if (userId === currentUserId) {
      setErrorMsg("본인 계정은 삭제할 수 없습니다.");
      return;
    }

    const confirmed = window.confirm(
      `정말 "${username}" 계정을 삭제할까요?\n\n토큰, 박스 기록이 모두 삭제됩니다.`
    );
    if (!confirmed) return;

    setDeletingUser(userId);
    setErrorMsg(null);

    const res = await fetch("/api/admin/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error || "계정 삭제에 실패했습니다.");
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }

    setDeletingUser(null);
  }

  async function refreshUsers() {
    setRefreshing(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("game_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data as GameProfile[]);
    setRefreshing(false);
  }

  const totalTokensInCirculation = users.reduce((sum, u) => sum + u.tokens, 0);
  const totalBoxesOpened = users.reduce((sum, u) => sum + u.total_boxes_opened, 0);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-xs sm:text-sm text-yellow-300 pixel-glow">👑 관리 패널</h1>
        <button
          onClick={refreshUsers}
          disabled={refreshing}
          className="pixel-btn pixel-btn-primary text-[9px] px-3 py-2"
        >
          {refreshing ? "..." : "↻ 새로고침"}
        </button>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="pixel-card text-center">
          <div className="text-[9px] text-gray-500 mb-1">플레이어</div>
          <div className="text-xl text-indigo-300">{users.length}</div>
        </div>
        <div className="pixel-card text-center">
          <div className="text-[9px] text-gray-500 mb-1">토큰 총량</div>
          <div className="text-xl text-yellow-300">{totalTokensInCirculation}🎫</div>
        </div>
        <div className="pixel-card text-center">
          <div className="text-[9px] text-gray-500 mb-1">총 오픈</div>
          <div className="text-xl text-green-300">{totalBoxesOpened}</div>
        </div>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs border border-red-800 bg-red-950 p-3"
        >
          ⚠ {errorMsg}
        </motion.div>
      )}

      {/* 유저 목록 */}
      <div className="pixel-card">
        <div className="text-xs text-gray-500 mb-4">── 플레이어 목록 ──</div>

        {users.length === 0 ? (
          <div className="text-center text-gray-600 text-xs py-8">
            등록된 플레이어가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <motion.div
                key={u.id}
                className={`border-2 p-3 transition-all ${
                  successUser === u.id
                    ? "border-green-400 bg-green-950"
                    : u.id === currentUserId
                    ? "border-yellow-700 bg-yellow-950/30"
                    : "border-gray-700 bg-gray-900/50"
                }`}
                animate={
                  successUser === u.id
                    ? { scale: [1, 1.02, 1] }
                    : { scale: 1 }
                }
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* 유저 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-indigo-300 truncate">
                        {u.username}
                      </span>
                      {u.id === currentUserId && (
                        <span className="text-[8px] text-yellow-400 border border-yellow-700 px-1">
                          나
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-[9px] text-gray-500">
                      <span>🎫 {u.tokens}개</span>
                      <span>📦 {u.total_boxes_opened}회</span>
                    </div>
                  </div>

                  {/* 토큰 지급 + 삭제 */}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={tokenAmounts[u.id] ?? 5}
                      onChange={(e) =>
                        setTokenAmounts((prev) => ({
                          ...prev,
                          [u.id]: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="pixel-input w-20 sm:w-16 text-center"
                    />
                    <button
                      onClick={() => giveTokens(u.id)}
                      disabled={loadingUser === u.id || deletingUser === u.id}
                      className={`pixel-btn text-[9px] px-3 py-2 ${
                        successUser === u.id
                          ? "pixel-btn-success"
                          : "pixel-btn-primary"
                      }`}
                    >
                      {loadingUser === u.id ? (
                        "..."
                      ) : successUser === u.id ? (
                        "✓ 완료!"
                      ) : (
                        "🎫 지급"
                      )}
                    </button>
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => deleteUser(u.id, u.username)}
                        disabled={deletingUser === u.id || loadingUser === u.id}
                        className="pixel-btn pixel-btn-danger text-[9px] px-3 py-2"
                      >
                        {deletingUser === u.id ? "..." : "🗑 삭제"}
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {successUser === u.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 text-[9px] text-green-400 text-center"
                    >
                      ✓ {tokenAmounts[u.id] ?? 5}개 토큰 지급 완료!
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 어드민 설정 안내 */}
      <div className="pixel-card border-yellow-800">
        <div className="text-[9px] text-yellow-600 mb-2">── 어드민 설정 ──</div>
        <div className="text-[8px] text-gray-600 space-y-1">
          <div>다른 유저를 어드민으로 설정하려면:</div>
          <div className="bg-gray-950 border border-gray-800 p-2 text-green-400 text-[8px] font-mono">
            UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data ||
            {`'{"is_admin": true}'`} WHERE email = &apos;email@example.com&apos;;
          </div>
          <div className="text-gray-700">
            Supabase 대시보드 → SQL Editor에서 실행
          </div>
        </div>
      </div>
    </div>
  );
}
