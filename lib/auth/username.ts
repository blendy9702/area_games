/** 로그인·회원가입 공통 필드명 */
export const IDENTITY_FIELD_LABEL = "이름 또는 아이디";
export const PIN_FIELD_LABEL = "고유번호 앞자리";

/** 표시용 이름/아이디 정규화 (앞뒤 공백 제거, NFC) */
export function normalizeUsername(input: string): string {
  return input.trim().normalize("NFC");
}

/** 한글 이름·영문 아이디·숫자·_ 허용, 2~12자 */
export function isValidUsername(username: string): boolean {
  if (username.length < 2 || username.length > 12) return false;
  return /^[\p{L}\p{N}_]+$/u.test(username);
}

export function usernameValidationError(): string {
  return `${IDENTITY_FIELD_LABEL}는 2~12자 (한글, 영문, 숫자, _)만 사용 가능합니다.`;
}

export function identityPlaceholder(): string {
  return "한글 이름 또는 아이디 (2~12자)";
}

export function identityHint(): string {
  return "한글 이름 또는 영문 아이디, 숫자, _ 사용 가능";
}

export function identityRequiredError(): string {
  return `${IDENTITY_FIELD_LABEL}와 ${PIN_FIELD_LABEL}를 입력해주세요.`;
}

export function identityAuthFailedError(): string {
  return `${IDENTITY_FIELD_LABEL} 또는 ${PIN_FIELD_LABEL}가 올바르지 않습니다.`;
}

export function identityDuplicateError(): string {
  return `이미 사용 중인 ${IDENTITY_FIELD_LABEL}입니다.`;
}

/** Supabase auth 이메일용 로컬 파트 (한글은 base64url 인코딩, 아이디는 소문자) */
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
  return `${PIN_FIELD_LABEL}는 8자리 숫자만 입력 가능합니다.`;
}

export function pinCodeHint(): string {
  return "8자리 숫자만 입력 가능 (예: 00000000)";
}
