import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId : "";

    if (!userId) {
      return NextResponse.json(
        { error: "삭제할 계정을 지정해주세요." },
        { status: 400 }
      );
    }

    if (userId === auth.user.id) {
      return NextResponse.json(
        { error: "본인 계정은 삭제할 수 없습니다." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("not configured")
        ? "서버 설정이 완료되지 않았습니다. SUPABASE_SERVICE_ROLE_KEY를 확인해주세요."
        : "계정 삭제 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
