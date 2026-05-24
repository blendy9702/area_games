import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeUsername,
  isValidUsername,
  usernameValidationError,
  isValidPinCode,
  pinCodeValidationError,
  usernameToAuthEmail,
  identityDuplicateError,
} from "@/lib/auth/username";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    const normalizedIdentity = normalizeUsername(username);

    if (!isValidUsername(normalizedIdentity)) {
      return NextResponse.json(
        { error: usernameValidationError() },
        { status: 400 }
      );
    }

    if (!isValidPinCode(password)) {
      return NextResponse.json(
        { error: pinCodeValidationError() },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const email = usernameToAuthEmail(normalizedIdentity);

    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: normalizedIdentity },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("duplicate")
      ) {
        return NextResponse.json(
          { error: identityDuplicateError() },
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
