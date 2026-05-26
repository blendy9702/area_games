"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GRADE_INFO, type Grade, type BoxHistory, type ShopPurchase } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";
import GradeStatsSection from "@/components/GradeStatsSection";
import {
  buildHistoryTimeline,
  formatHistoryDate,
  type HistoryEntry,
} from "@/lib/history";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const GRADE_ICONS: Record<Grade, string> = {
  common: "⬜",
  rare: "🔵",
  epic: "🟣",
  legendary: "🟡",
  mythic: "🔴",
  secret: "⬛",
};

interface HistoryPanelProps {
  userId: string;
  initialTotalOpens: number;
  initialTotalPoints: number;
  initialTokens: number;
  isAdmin: boolean;
  initialHistory: BoxHistory[];
  initialShopPurchases: ShopPurchase[];
}

export default function HistoryPanel({
  userId,
  initialTotalOpens,
  initialTotalPoints,
  initialTokens,
  isAdmin,
  initialHistory,
  initialShopPurchases,
}: HistoryPanelProps) {
  const router = useRouter();
  const [history, setHistory] = useState<BoxHistory[]>(initialHistory);
  const [shopPurchases, setShopPurchases] =
    useState<ShopPurchase[]>(initialShopPurchases);
  const [totalOpens, setTotalOpens] = useState(initialTotalOpens);
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const timeline = buildHistoryTimeline(history, shopPurchases);

  const stats = history.reduce(
    (acc, item) => {
      acc[item.grade as Grade] = (acc[item.grade as Grade] || 0) + 1;
      return acc;
    },
    {} as Partial<Record<Grade, number>>
  );

  const bestGrade =
    history.length > 0
      ? (["secret", "mythic", "legendary", "epic", "rare", "common"] as Grade[]).find(
          (grade) => stats[grade]
        ) || "common"
      : null;

  async function resetHistory() {
    setResetting(true);

    const supabase = createClient();
    const { error } = await supabase.rpc("reset_game_history", {
      p_user_id: userId,
    });

    if (error) {
      toast.error(error.message, { icon: "⚠" });
      setResetting(false);
      return;
    }

    setHistory([]);
    setShopPurchases([]);
    setTotalOpens(0);
    setTotalPoints(0);
    setResetting(false);
    setResetDialogOpen(false);
    toast.success("기록이 초기화되었습니다.", { icon: "✓" });
    router.refresh();
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="pixel-card text-center">
          <div className="text-sm text-gray-500 mb-1">총 오픈</div>
          <div className="text-xl text-green-300">{totalOpens}</div>
        </div>
        <div className="pixel-card text-center">
          <div className="text-sm text-gray-500 mb-1">총 포인트</div>
          <div className="text-xl text-yellow-300">{totalPoints}</div>
        </div>
        <div className="pixel-card text-center">
          <div className="text-sm text-gray-500 mb-1">최고 등급</div>
          <div className="text-xl">
            {bestGrade ? GRADE_ICONS[bestGrade] : "❓"}
          </div>
        </div>
        <div className="pixel-card text-center">
          <div className="text-sm text-gray-500 mb-1">남은 토큰</div>
          <div className="text-xl text-indigo-300">
            {formatTokens(initialTokens, isAdmin)}🎫
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <GradeStatsSection stats={stats} totalCount={history.length} />
      )}

      <div className="pixel-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="text-sm text-gray-500">── 최근 활동 ──</div>
          {timeline.length > 0 && (
            <button
              type="button"
              onClick={() => setResetDialogOpen(true)}
              disabled={resetting}
              className="pixel-btn pixel-btn-danger text-xs sm:text-sm px-3 py-2 self-start sm:self-auto"
            >
              {resetting ? "초기화 중..." : "🗑 기록 초기화"}
            </button>
          )}
        </div>

        {timeline.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">
            아직 기록이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {timeline.map((entry) => (
              <HistoryRow key={`${entry.kind}-${entry.id}`} entry={entry} />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기록을 초기화할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              박스 오픈 기록, 상점 구매 기록, 등급 통계, 포인트, 오픈 횟수가 삭제됩니다.
              {"\n\n"}토큰은 유지되며, 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>취소</AlertDialogCancel>
            <button
              type="button"
              disabled={resetting}
              className="pixel-btn pixel-btn-danger w-full sm:w-auto px-4 py-2 text-sm disabled:opacity-50"
              onClick={resetHistory}
            >
              {resetting ? "초기화 중..." : "초기화"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  if (entry.kind === "shop") {
    return (
      <div className="flex items-center justify-between border border-gray-800 p-2 hover:bg-gray-900 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg shrink-0">{entry.itemEmoji}</span>
          <div className="min-w-0">
            <div className="text-xs text-purple-400 mb-0.5">🛒 상점 구매</div>
            <div className="text-sm text-indigo-200 truncate">{entry.itemName}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm text-orange-300">
            -{entry.points.toLocaleString("ko-KR")}pt
          </span>
          <span className="text-xs text-gray-600">
            {formatHistoryDate(entry.created_at)}
          </span>
        </div>
      </div>
    );
  }

  const info = GRADE_INFO[entry.grade];

  return (
    <div className="flex items-center justify-between border border-gray-800 p-2 hover:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-lg">{GRADE_ICONS[entry.grade]}</span>
        <span className={`text-sm ${info.textColor}`}>{info.label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-yellow-300">+{entry.points}pt</span>
        <span className="text-xs text-gray-600">
          {formatHistoryDate(entry.created_at)}
        </span>
      </div>
    </div>
  );
}
