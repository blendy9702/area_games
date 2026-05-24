import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import { GRADE_INFO, type Grade, type GameProfile, type BoxHistory } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";

const HISTORY_LIMIT = 1000;

const GRADE_ICONS: Record<Grade, string> = {
  common: "⬜",
  rare: "🔵",
  epic: "🟣",
  legendary: "🟡",
  mythic: "🔴",
  secret: "⬛",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("game_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: history } = await supabase
    .from("game_box_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  const isAdmin =
    (user.app_metadata?.is_admin as boolean | undefined) === true;

  // 등급별 통계
  const stats = (history || []).reduce(
    (acc, h) => {
      acc[h.grade as Grade] = (acc[h.grade as Grade] || 0) + 1;
      return acc;
    },
    {} as Record<Grade, number>
  );

  const totalPoints = (history || []).reduce(
    (sum, h) => sum + h.points_earned,
    0
  );

  return (
    <div className="page-shell">
      <NavBar profile={profile as GameProfile} isAdmin={isAdmin} />
      <main className="flex-1 max-w-5xl mx-auto w-full safe-area-x px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-6">
          <h1 className="text-base sm:text-lg text-indigo-300 pixel-glow mb-4">
            📜 오픈 기록
          </h1>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="pixel-card text-center">
              <div className="text-sm text-gray-500 mb-1">총 오픈</div>
              <div className="text-xl text-green-300">
                {(profile as GameProfile)?.total_boxes_opened ?? history?.length ?? 0}
              </div>
            </div>
            <div className="pixel-card text-center">
              <div className="text-sm text-gray-500 mb-1">총 포인트</div>
              <div className="text-xl text-yellow-300">{totalPoints}</div>
            </div>
            <div className="pixel-card text-center">
              <div className="text-sm text-gray-500 mb-1">최고 등급</div>
              <div className="text-xl">
                {history && history.length > 0
                  ? GRADE_ICONS[
                      (["secret", "mythic", "legendary", "epic", "rare", "common"].find(
                        (g) => stats[g as Grade]
                      ) as Grade) || "common"
                    ]
                  : "❓"}
              </div>
            </div>
            <div className="pixel-card text-center">
              <div className="text-sm text-gray-500 mb-1">남은 토큰</div>
              <div className="text-xl text-indigo-300">
                {formatTokens((profile as GameProfile)?.tokens || 0, isAdmin)}🎫
              </div>
            </div>
          </div>

          {/* 등급 분포 */}
          {history && history.length > 0 && (
            <div className="pixel-card mb-6">
              <div className="text-sm text-gray-500 mb-3">── 등급 통계 ──</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(["secret", "mythic", "legendary", "epic", "rare", "common"] as Grade[]).map(
                  (grade) => {
                    const info = GRADE_INFO[grade];
                    const count = stats[grade] || 0;
                    const pct =
                      history.length > 0
                        ? ((count / history.length) * 100).toFixed(1)
                        : "0";
                    return (
                      <div key={grade} className="text-center">
                        <div className="text-lg mb-1">{GRADE_ICONS[grade]}</div>
                        <div className={`text-xs sm:text-sm ${info.textColor} mb-1`}>
                          {info.label}
                        </div>
                        <div className="text-sm text-white">{count}</div>
                        <div className="text-xs text-gray-500">{pct}%</div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* 히스토리 목록 */}
          <div className="pixel-card">
            <div className="text-sm text-gray-500 mb-3">── 최근 {HISTORY_LIMIT}개 ──</div>
            {!history || history.length === 0 ? (
              <div className="text-center text-gray-600 text-sm py-8">
                아직 박스를 열지 않았습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {(history as BoxHistory[]).map((h) => {
                  const info = GRADE_INFO[h.grade];
                  return (
                    <div
                      key={h.id}
                      className={`flex items-center justify-between border border-gray-800 p-2 hover:bg-gray-900 transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{GRADE_ICONS[h.grade]}</span>
                        <span className={`text-sm ${info.textColor}`}>
                          {info.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-yellow-300">
                          +{h.points_earned}pt
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(h.created_at).toLocaleDateString("ko-KR", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
