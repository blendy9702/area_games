import { toast } from "sonner";

/** 형식 검증·로그인/회원가입 실패 알림 (픽셀 스타일 Sonner) */
export function showValidationToast(message: string) {
  toast.error(message, {
    duration: 4200,
    icon: "\u26A0",
  });
}

export function showAuthSuccessToast(message: string) {
  toast.success(message, {
    duration: 2800,
    icon: "\u2713",
  });
}
