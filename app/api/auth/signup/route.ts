import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    const trimmed = username.trim().toLowerCase();

    if (trimmed.length < 2 || trimmed.length > 12) {
      return NextResponse.json(
        { error: "아이디는 2~12자로 입력해주세요." },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      return NextResponse.json(
        { error: "아이디는 영문 소문자, 숫자, _ 만 사용 가능합니다." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const email = `${trimmed}@area-games.com`;

    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: trimmed },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("duplicate")
      ) {
        return NextResponse.json(
          { error: "이미 사용 중인 아이디입니다." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("not configured")
        ? "서버 설정이 완료되지 않았습니다. SUPABASE_SERVICE_ROLE_KEY를 확인해주세요."
        : "회원가입 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
