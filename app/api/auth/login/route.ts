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
  identityRequiredError,
  identityAuthFailedError,
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
    const normalizedIdentity = normalizeUsername(username);

    if (!normalizedIdentity || !password) {
      return NextResponse.json(
        { error: identityRequiredError() },
        { status: 400 }
      );
    }

    if (!isValidPinCode(password)) {
      return NextResponse.json(
        { error: pinCodeValidationError() },
        { status: 400 }
      );
    }

    const email = usernameToAuthEmail(normalizedIdentity);
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
        { error: identityAuthFailedError() },
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
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
