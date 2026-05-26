import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import ShopClient from "@/components/ShopClient";
import type { GameProfile } from "@/lib/types";
import type { ShopItemId } from "@/lib/shop";

export default async function ShopPage() {
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

  const { data: purchases } = await supabase
    .from("game_shop_purchases")
    .select("item_id")
    .eq("user_id", user.id);

  const isAdmin =
    (user.app_metadata?.is_admin as boolean | undefined) === true;

  const purchasedIds = (purchases || []).map(
    (purchase) => purchase.item_id as ShopItemId
  );

  return (
    <div className="page-shell">
      <NavBar profile={profile as GameProfile} isAdmin={isAdmin} />
      <main className="flex-1 max-w-5xl mx-auto w-full safe-area-x px-3 sm:px-4 py-4 sm:py-8">
        <ShopClient
          initialProfile={profile as GameProfile}
          initialPurchasedIds={purchasedIds}
          isAdmin={isAdmin}
        />
      </main>
    </div>
  );
}
