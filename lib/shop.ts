export type ShopItemId =
  | "keycap_keyring"
  | "ramen_cup"
  | "cyber_burger"
  | "starbucks_americano"
  | "bbq_chicken"
  | "gs25_giftcard"
  | "cgv_movie_ticket"
  | "emart_giftcard_10000"
  | "baemin_giftcard_10000"
  | "naverpay_20000"
  | "iphone_17"
  | "ferrari_488";

export interface ShopItem {
  id: ShopItemId;

  name: string;

  price: number;

  emoji: string;

  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "keycap_keyring",

    name: "키캡 키링",

    price: 200,

    emoji: "⌨️",

    description: "기계식 키보드 키캡 키링",
  },

  {
    id: "ramen_cup",

    name: "컵라면 1개",

    price: 200,

    emoji: "🍜",

    description: "편의점·마트에서 바로 교환",
  },

  {
    id: "cyber_burger",

    name: "맘스터치 싸이버거",

    price: 500,

    emoji: "🍔",

    description: "세트 메뉴 1인분",
  },

  {
    id: "starbucks_americano",

    name: "스타벅스 아메리카노",

    price: 500,

    emoji: "☕",

    description: "Tall 사이즈 기프티콘",
  },

  {
    id: "gs25_giftcard",

    name: "GS25 5,000원 기프티콘",

    price: 500,

    emoji: "🎁",

    description: "전국 GS25 매장 사용",
  },

  {
    id: "emart_giftcard_10000",

    name: "이마트 1만원 상품권",

    price: 1000,

    emoji: "🛒",

    description: "이마트·트레이더스 사용",
  },

  {
    id: "baemin_giftcard_10000",

    name: "배달의민족 1만원",

    price: 1000,

    emoji: "🛵",

    description: "배민앱 결제 시 사용",
  },

  {
    id: "cgv_movie_ticket",

    name: "CGV 2D 영화 관람권",

    price: 1500,

    emoji: "🎬",

    description: "주중·주말 2D 1매",
  },

  {
    id: "naverpay_20000",

    name: "네이버페이 2만원",

    price: 2000,

    emoji: "💳",

    description: "온·오프라인 결제 가능",
  },

  {
    id: "bbq_chicken",

    name: "BBQ 황금올리브",

    price: 2500,

    emoji: "🍗",

    description: "배달·포장 가능",
  },

  {
    id: "iphone_17",

    name: "아이폰 17",

    price: 50000,

    emoji: "📱",

    description: "128GB 기준",
  },

  {
    id: "ferrari_488",

    name: "페라리 488",

    price: 9999999,

    emoji: "🏎️",

    description: "488 GTB (신차 기준)",
  },
];

export const SHOP_ITEM_MAP = Object.fromEntries(
  SHOP_ITEMS.map((item) => [item.id, item]),
) as Record<ShopItemId, ShopItem>;

/** 구 ID → 신 ID (인벤·기록 표시용) */

export const LEGACY_SHOP_ITEM_IDS: Record<string, ShopItemId> = {
  golden_chicken_nugget: "bbq_chicken",

  unicorn_subscription: "cgv_movie_ticket",

  cat_emperor_title: "emart_giftcard_10000",

  time_machine_pass: "baemin_giftcard_10000",

  secret_base_pass: "naverpay_20000",
};

export function resolveShopItemId(itemId: string): ShopItemId | null {
  if (itemId in SHOP_ITEM_MAP) return itemId as ShopItemId;

  return LEGACY_SHOP_ITEM_IDS[itemId] ?? null;
}

export function formatShopPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}pt`;
}
