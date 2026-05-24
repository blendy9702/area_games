import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeUsername,
  isValidUsername,
  usernameValidationError,
  isValidPinCode,
  pinCodeValidationError,
  usernameToAuthEmail,
} from "@/lib/auth/username";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    const normalizedName = normalizeUsername(username);

    if (!isValidUsername(normalizedName)) {
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
    const email = usernameToAuthEmail(normalizedName);

    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: normalizedName },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("duplicate")
      ) {
        return NextResponse.json(
          { error: "\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC774\uB984\uC785\uB2C8\uB2E4." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("not configured")
        ? "\uC11C\uBC84 \uC124\uC815\uC774 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. SUPABASE_SERVICE_ROLE_KEY\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694."
        : "\uD68C\uC6D0\uAC00\uC785 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
