/** 표시용 이름 정규화 (앞뒤 공백 제거, NFC) */
export function normalizeUsername(input: string): string {
  return input.trim().normalize("NFC");
}

/** 한글·영문·숫자·_ 허용, 2~12자 */
export function isValidUsername(username: string): boolean {
  if (username.length < 2 || username.length > 12) return false;
  return /^[\p{L}\p{N}_]+$/u.test(username);
}

export function usernameValidationError(): string {
  return "이름은 2~12자 (한글, 영문, 숫자, _)만 사용 가능합니다.";
}

/** Supabase auth 이메일용 로컬 파트 (한글은 base64url 인코딩) */
export function usernameToEmailLocal(username: string): string {
  const normalized = normalizeUsername(username);
  if (/^[a-zA-Z0-9_]+$/.test(normalized)) {
    return normalized.toLowerCase();
  }
  return `u.${Buffer.from(normalized, "utf8").toString("base64url")}`;
}

export function usernameToAuthEmail(username: string): string {
  return `${usernameToEmailLocal(username)}@area-games.com`;
}

export const PIN_CODE_REGEX = /^\d{8}$/;

export function isValidPinCode(code: string): boolean {
  return PIN_CODE_REGEX.test(code);
}

export function pinCodeValidationError(): string {
  return "고유번호 앞자리는 8자리 숫자만 입력 가능합니다.";
}
