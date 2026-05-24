import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import AdminClient from "@/components/AdminClient";
import type { GameProfile } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdmin =
    (user.app_metadata?.is_admin as boolean | undefined) === true;

  if (!isAdmin) redirect("/game");

  const { data: profile } = await supabase
    .from("game_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: allUsers } = await supabase
    .from("game_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="page-shell">
      <NavBar profile={profile as GameProfile} isAdmin={isAdmin} />
      <main className="flex-1 max-w-5xl mx-auto w-full safe-area-x px-3 sm:px-4 py-4 sm:py-8">
        <AdminClient
          currentUserId={user.id}
          initialUsers={(allUsers || []) as GameProfile[]}
        />
      </main>
    </div>
  );
}
