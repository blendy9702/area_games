import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import InventoryClient from "@/components/InventoryClient";
import { buildInventory } from "@/lib/inventory";
import type { GameProfile, ShopPurchase } from "@/lib/types";

export default async function InventoryPage() {
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
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const isAdmin =
    (user.app_metadata?.is_admin as boolean | undefined) === true;

  const inventory = buildInventory((purchases || []) as ShopPurchase[]);

  return (
    <div className="page-shell">
      <NavBar profile={profile as GameProfile} isAdmin={isAdmin} />
      <main className="flex-1 max-w-5xl mx-auto w-full safe-area-x px-3 sm:px-4 py-4 sm:py-8">
        <InventoryClient items={inventory} />
      </main>
    </div>
  );
}
