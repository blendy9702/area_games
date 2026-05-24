export type Grade =
  | "common"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "secret";

export interface GradeInfo {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  points: number;
  probability: number;
  description: string;
}

export const GRADE_INFO: Record<Grade, GradeInfo> = {
  common: {
    label: "일반",
    color: "#9ca3af",
    bgColor: "bg-gray-600",
    borderColor: "border-gray-400",
    textColor: "text-gray-300",
    points: 1,
    probability: 53,
    description: "흔한 아이템",
  },
  rare: {
    label: "희귀",
    color: "#3b82f6",
    bgColor: "bg-blue-600",
    borderColor: "border-blue-400",
    textColor: "text-blue-300",
    points: 5,
    probability: 30,
    description: "희귀한 아이템",
  },
  epic: {
    label: "에픽",
    color: "#a855f7",
    bgColor: "bg-purple-600",
    borderColor: "border-purple-400",
    textColor: "text-purple-300",
    points: 10,
    probability: 10,
    description: "에픽 아이템",
  },
  legendary: {
    label: "전설",
    color: "#f59e0b",
    bgColor: "bg-yellow-600",
    borderColor: "border-yellow-400",
    textColor: "text-yellow-300",
    points: 15,
    probability: 5,
    description: "전설의 아이템",
  },
  mythic: {
    label: "신화",
    color: "#ef4444",
    bgColor: "bg-red-600",
    borderColor: "border-red-400",
    textColor: "text-red-300",
    points: 30,
    probability: 1.5,
    description: "신화급 아이템",
  },
  secret: {
    label: "시크릿",
    color: "#1a1a2e",
    bgColor: "bg-gray-950",
    borderColor: "border-gray-300",
    textColor: "text-gray-100",
    points: 50,
    probability: 0.5,
    description: "???",
  },
};

export interface GameProfile {
  id: string;
  username: string;
  tokens: number;
  total_boxes_opened: number;
  created_at: string;
}

export interface BoxHistory {
  id: string;
  user_id: string;
  grade: Grade;
  points_earned: number;
  created_at: string;
}
