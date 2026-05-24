import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false as const,
      status: 401,
      error: "로그인이 필요합니다.",
    };
  }

  const isAdmin =
    (user.app_metadata?.is_admin as boolean | undefined) === true;

  if (!isAdmin) {
    return {
      ok: false as const,
      status: 403,
      error: "권한이 없습니다.",
    };
  }

  return { ok: true as const, user };
}
