"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { GameProfile } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminClientProps {
  currentUserId: string;
  initialUsers: GameProfile[];
}

export default function AdminClient({
  currentUserId,
  initialUsers,
}: AdminClientProps) {
  const [users, setUsers] = useState<GameProfile[]>(initialUsers);
  const [tokenAmounts, setTokenAmounts] = useState<Record<string, string>>({});
  const [pointValues, setPointValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialUsers.map((user) => [user.id, String(user.total_points ?? 0)])
    )
  );
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [savingPointsUser, setSavingPointsUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<string | null>(null);
  const [successPointsUser, setSuccessPointsUser] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GameProfile | null>(null);

  async function giveTokens(userId: string) {
    const raw = tokenAmounts[userId] ?? "5";
    const amount = parseInt(raw, 10);
    if (!Number.isFinite(amount) || amount < 1) {
      setErrorMsg("토큰은 1 이상이어야 합니다.");
      return;
    }

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

  async function savePoints(userId: string) {
    const raw = pointValues[userId];
    if (raw === undefined || raw === "") {
      setErrorMsg("포인트를 입력해주세요.");
      return;
    }

    const points = parseInt(raw, 10);
    if (!Number.isFinite(points) || points < 0) {
      setErrorMsg("포인트는 0 이상이어야 합니다.");
      return;
    }

    setSavingPointsUser(userId);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_player_points", {
      p_target_user_id: userId,
      p_points: points,
    });

    if (error) {
      setErrorMsg(`오류: ${error.message}`);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, total_points: points } : u))
      );
      setSuccessPointsUser(userId);
      setTimeout(() => setSuccessPointsUser(null), 2000);
    }

    setSavingPointsUser(null);
  }

  async function confirmDeleteUser() {
    if (!deleteTarget) return;

    const userId = deleteTarget.id;
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
    setDeleteTarget(null);
  }

  async function refreshUsers() {
    setRefreshing(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("game_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      const nextUsers = data as GameProfile[];
      setUsers(nextUsers);
      setPointValues(
        Object.fromEntries(
          nextUsers.map((user) => [user.id, String(user.total_points ?? 0)])
        )
      );
    }
    setRefreshing(false);
  }

  const totalTokensInCirculation = users.reduce((sum, u) => sum + u.tokens, 0);
  const totalBoxesOpened = users.reduce((sum, u) => sum + u.total_boxes_opened, 0);
  const totalPoints = users.reduce((sum, u) => sum + (u.total_points ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-sm sm:text-base text-yellow-300 pixel-glow">👑 관리 패널</h1>
        <button
          onClick={refreshUsers}
          disabled={refreshing}
          className="pixel-btn pixel-btn-primary text-sm px-3 py-2"
        >
          {refreshing ? "..." : "↻ 새로고침"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="pixel-card text-center">
          <div className="text-sm text-gray-500 mb-1">플레이어</div>
          <div className="text-xl text-indigo-300">{users.length}</div>
        </div>
        <div className="pixel-card text-center">
          <div className="text-sm text-gray-500 mb-1">토큰 총량</div>
          <div className="text-xl text-yellow-300">{totalTokensInCirculation}🎫</div>
        </div>
        <div className="pixel-card text-center">
          <div className="text-sm text-gray-500 mb-1">포인트 총량</div>
          <div className="text-xl text-amber-300">{totalPoints}pt</div>
        </div>
        <div className="pixel-card text-center">
          <div className="text-sm text-gray-500 mb-1">총 오픈</div>
          <div className="text-xl text-green-300">{totalBoxesOpened}</div>
        </div>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm border border-red-800 bg-red-950 p-3"
        >
          ⚠ {errorMsg}
        </motion.div>
      )}

      <div className="pixel-card">
        <div className="text-sm text-gray-500 mb-4">── 플레이어 목록 ──</div>

        {users.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">
            등록된 플레이어가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <motion.div
                key={u.id}
                className={`border-2 p-3 transition-all ${
                  successUser === u.id || successPointsUser === u.id
                    ? "border-green-400 bg-green-950"
                    : u.id === currentUserId
                    ? "border-yellow-700 bg-yellow-950/30"
                    : "border-gray-700 bg-gray-900/50"
                }`}
                animate={
                  successUser === u.id || successPointsUser === u.id
                    ? { scale: [1, 1.02, 1] }
                    : { scale: 1 }
                }
              >
                <div className="flex flex-col gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm text-indigo-300 truncate">
                        {u.username}
                      </span>
                      {u.id === currentUserId && (
                        <span className="text-xs text-yellow-400 border border-yellow-700 px-1">
                          나
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>
                        🔒 {u.pin_code ?? "미등록"}
                      </span>
                      <span>🎫 {u.tokens}개</span>
                      <span>⭐ {u.total_points ?? 0}pt</span>
                      <span>📦 {u.total_boxes_opened}회</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500 w-10 shrink-0">토큰</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={tokenAmounts[u.id] ?? "5"}
                          onChange={(e) =>
                            setTokenAmounts((prev) => ({
                              ...prev,
                              [u.id]: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          className="pixel-input w-20! shrink-0 text-center"
                        />
                        <button
                          onClick={() => giveTokens(u.id)}
                          disabled={loadingUser === u.id || deletingUser === u.id}
                          className={`pixel-btn text-sm px-3 py-2 shrink-0 ${
                            successUser === u.id
                              ? "pixel-btn-success"
                              : "pixel-btn-primary"
                          }`}
                        >
                          {loadingUser === u.id
                            ? "..."
                            : successUser === u.id
                            ? "✓ 완료!"
                            : "🎫 지급"}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500 w-12 shrink-0">포인트</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={pointValues[u.id] ?? String(u.total_points ?? 0)}
                          onChange={(e) =>
                            setPointValues((prev) => ({
                              ...prev,
                              [u.id]: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          className="pixel-input w-24! shrink-0 text-center"
                        />
                        <button
                          onClick={() => savePoints(u.id)}
                          disabled={
                            savingPointsUser === u.id ||
                            deletingUser === u.id ||
                            loadingUser === u.id
                          }
                          className={`pixel-btn text-sm px-3 py-2 shrink-0 ${
                            successPointsUser === u.id
                              ? "pixel-btn-success"
                              : "border-2 border-amber-500 bg-amber-950 text-amber-200 hover:brightness-110"
                          }`}
                        >
                          {savingPointsUser === u.id
                            ? "..."
                            : successPointsUser === u.id
                            ? "✓ 저장!"
                            : "⭐ 저장"}
                        </button>
                      </div>

                      {u.id !== currentUserId && (
                        <button
                          onClick={() => {
                            if (u.id === currentUserId) {
                              setErrorMsg("본인 계정은 삭제할 수 없습니다.");
                              return;
                            }
                            setDeleteTarget(u);
                          }}
                          disabled={deletingUser === u.id || loadingUser === u.id}
                          className="pixel-btn pixel-btn-danger text-sm px-3 py-2 shrink-0 ml-auto"
                        >
                          {deletingUser === u.id ? "..." : "🗑 삭제"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {successUser === u.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 text-sm text-green-400 text-center"
                    >
                      ✓ {tokenAmounts[u.id] ?? "5"}개 토큰 지급 완료!
                    </motion.div>
                  )}
                  {successPointsUser === u.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 text-sm text-green-400 text-center"
                    >
                      ✓ 포인트 {pointValues[u.id] ?? String(u.total_points ?? 0)}pt로 저장됨
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="pixel-card border-yellow-800">
        <div className="text-sm text-yellow-600 mb-2">── 어드민 설정 ──</div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>다른 유저를 어드민으로 설정하려면:</div>
          <div className="bg-gray-950 border border-gray-800 p-2 text-green-400 text-xs font-mono">
            UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data ||
            {`'{"is_admin": true}'`} WHERE email = &apos;email@example.com&apos;;
          </div>
          <div className="text-gray-700">
            Supabase 대시보드 → SQL Editor에서 실행
          </div>
        </div>
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>계정을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.username}" 계정을 삭제합니다.\n\n토큰, 포인트, 박스 기록이 모두 삭제되며 되돌릴 수 없습니다.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={confirmDeleteUser}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
