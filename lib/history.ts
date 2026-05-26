import type { BoxHistory, ShopPurchase } from "./types";
import { SHOP_ITEM_MAP, resolveShopItemId, type ShopItemId } from "./shop";
import type { Grade } from "./types";

export type BoxHistoryEntry = {
  kind: "box";
  id: string;
  created_at: string;
  grade: Grade;
  points: number;
};

export type ShopHistoryEntry = {
  kind: "shop";
  id: string;
  created_at: string;
  itemId: ShopItemId;
  itemName: string;
  itemEmoji: string;
  points: number;
};

export type HistoryEntry = BoxHistoryEntry | ShopHistoryEntry;

export function buildHistoryTimeline(
  boxHistory: BoxHistory[],
  shopPurchases: ShopPurchase[]
): HistoryEntry[] {
  const boxEntries: BoxHistoryEntry[] = boxHistory.map((item) => ({
    kind: "box",
    id: item.id,
    created_at: item.created_at,
    grade: item.grade,
    points: item.points_earned,
  }));

  const shopEntries: ShopHistoryEntry[] = shopPurchases.flatMap((purchase) => {
    const itemId = resolveShopItemId(purchase.item_id);
    if (!itemId) return [];

    const item = SHOP_ITEM_MAP[itemId];
    return [
      {
        kind: "shop" as const,
        id: purchase.id,
        created_at: purchase.created_at,
        itemId,
        itemName: item.name,
        itemEmoji: item.emoji,
        points: purchase.points_spent,
      },
    ];
  });

  return [...boxEntries, ...shopEntries].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function formatHistoryDate(value: string): string {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
