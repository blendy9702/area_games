import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GameShell from "@/components/GameShell";
import type { GameProfile } from "@/lib/types";

export default async function GamePage() {
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

  const isAdmin =
    (user.app_metadata?.is_admin as boolean | undefined) === true;

  return (
    <GameShell
      initialProfile={profile as GameProfile}
      userId={user.id}
      isAdmin={isAdmin}
    />
  );
}
