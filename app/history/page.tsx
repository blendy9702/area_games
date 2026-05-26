import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import HistoryPanel from "@/components/HistoryPanel";
import type { GameProfile, BoxHistory, ShopPurchase } from "@/lib/types";

const HISTORY_LIMIT = 1000;

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

  const { data: shopPurchases } = await supabase
    .from("game_shop_purchases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  const isAdmin =
    (user.app_metadata?.is_admin as boolean | undefined) === true;

  const gameProfile = profile as GameProfile | null;

  return (
    <div className="page-shell">
      <NavBar profile={gameProfile as GameProfile} isAdmin={isAdmin} />
      <main className="flex-1 max-w-5xl mx-auto w-full safe-area-x px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-6">
          <h1 className="text-base sm:text-lg text-indigo-300 pixel-glow mb-4">
            📜 오픈 기록
          </h1>

          <HistoryPanel
            userId={user.id}
            initialTotalOpens={gameProfile?.total_boxes_opened ?? history?.length ?? 0}
            initialTotalPoints={gameProfile?.total_points ?? 0}
            initialTokens={gameProfile?.tokens ?? 0}
            isAdmin={isAdmin}
            initialHistory={(history || []) as BoxHistory[]}
            initialShopPurchases={(shopPurchases || []) as ShopPurchase[]}
          />
        </div>
      </main>
    </div>
  );
}
