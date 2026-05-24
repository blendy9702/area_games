/** 로그인 유지 시 쿠키 유효 기간 (30일) */
export const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30;

export const REMEMBER_ME_PREF_COOKIE = "remember_login";

export function applyRememberMeToCookieOptions(
  options: Record<string, unknown>,
  rememberMe: boolean
) {
  if (rememberMe) {
    return {
      ...options,
      maxAge: REMEMBER_ME_MAX_AGE,
    };
  }
  // 브라우저 종료 시 만료 (세션 쿠키)
  const { maxAge: _maxAge, expires: _expires, ...sessionOptions } = options;
  return sessionOptions;
}
