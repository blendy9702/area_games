import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  REMEMBER_ME_PREF_COOKIE,
  applyRememberMeToCookieOptions,
} from "@/lib/auth/cookies";
import {
  normalizeUsername,
  isValidPinCode,
  pinCodeValidationError,
  usernameToAuthEmail,
} from "@/lib/auth/username";

type CookieToSet = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    const rememberMe = body.rememberMe !== false;
    const normalizedName = normalizeUsername(username);

    if (!normalizedName || !password) {
      return NextResponse.json(
        { error: "\uC774\uB984\uACFC \uACE0\uC720\uBC88\uD638 \uC55E\uC790\uB9AC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694." },
        { status: 400 }
      );
    }

    if (!isValidPinCode(password)) {
      return NextResponse.json(
        { error: pinCodeValidationError() },
        { status: 400 }
      );
    }

    const email = usernameToAuthEmail(normalizedName);
    const cookieStore = await cookies();
    const authCookies: CookieToSet[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              authCookies.push({
                name,
                value,
                options: applyRememberMeToCookieOptions(
                  options as Record<string, unknown>,
                  rememberMe
                ),
              });
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: "\uC774\uB984 \uB610\uB294 \uACE0\uC720\uBC88\uD638 \uC55E\uC790\uB9AC\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    authCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    response.cookies.set(REMEMBER_ME_PREF_COOKIE, rememberMe ? "1" : "0", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "\uB85C\uADF8\uC778 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." },
      { status: 500 }
    );
  }
}
