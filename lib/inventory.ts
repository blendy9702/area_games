import type { ShopPurchase } from "./types";
import { SHOP_ITEMS, SHOP_ITEM_MAP, resolveShopItemId, type ShopItemId } from "./shop";

export interface InventoryItem {
  itemId: ShopItemId;
  name: string;
  emoji: string;
  description: string;
  price: number;
  count: number;
  lastPurchasedAt: string;
  latestPurchasePoints: number;
}

export function calculateRefundAmount(pointsSpent: number): number {
  return Math.floor((pointsSpent * 80) / 100);
}

export function buildInventory(purchases: ShopPurchase[]): InventoryItem[] {
  const grouped = new Map<
    ShopItemId,
    { count: number; lastPurchasedAt: string; latestPurchasePoints: number }
  >();

  for (const purchase of purchases) {
    const itemId = resolveShopItemId(purchase.item_id);
    if (!itemId) continue;

    const existing = grouped.get(itemId);

    if (!existing) {
      grouped.set(itemId, {
        count: 1,
        lastPurchasedAt: purchase.created_at,
        latestPurchasePoints: purchase.points_spent,
      });
      continue;
    }

    existing.count += 1;
    if (new Date(purchase.created_at) > new Date(existing.lastPurchasedAt)) {
      existing.lastPurchasedAt = purchase.created_at;
      existing.latestPurchasePoints = purchase.points_spent;
    }
  }

  const inventory: InventoryItem[] = [];

  for (const [itemId, data] of grouped.entries()) {
    const item = SHOP_ITEM_MAP[itemId];
    if (!item) continue;

    inventory.push({
      itemId,
      name: item.name,
      emoji: item.emoji,
      description: item.description,
      price: item.price,
      count: data.count,
      lastPurchasedAt: data.lastPurchasedAt,
      latestPurchasePoints: data.latestPurchasePoints,
    });
  }

  const order = new Map(SHOP_ITEMS.map((item, index) => [item.id, index]));

  return inventory.sort((a, b) => {
    const orderDiff = (order.get(a.itemId) ?? 999) - (order.get(b.itemId) ?? 999);
    if (orderDiff !== 0) return orderDiff;
    return (
      new Date(b.lastPurchasedAt).getTime() - new Date(a.lastPurchasedAt).getTime()
    );
  });
}

export function formatInventoryDate(value: string): string {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
