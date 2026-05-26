"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { GameProfile } from "@/lib/types";
import {
  SHOP_ITEMS,
  formatShopPrice,
  type ShopItem,
  type ShopItemId,
} from "@/lib/shop";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ShopClientProps {
  initialProfile: GameProfile;
  initialPurchasedIds: ShopItemId[];
  isAdmin: boolean;
}

export default function ShopClient({
  initialProfile,
  initialPurchasedIds,
  isAdmin,
}: ShopClientProps) {
  const router = useRouter();
  const [points, setPoints] = useState(initialProfile.total_points ?? 0);
  const [purchasedIds, setPurchasedIds] = useState<Set<ShopItemId>>(
    new Set(initialPurchasedIds)
  );
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  async function confirmPurchase() {
    if (!selectedItem) return;

    setPurchasing(true);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("purchase_shop_item", {
      p_item_id: selectedItem.id,
    });

    if (error) {
      const message =
        error.message.includes("Already purchased")
          ? "이미 구매한 상품입니다."
          : error.message.includes("Not enough points")
          ? "포인트가 부족합니다."
          : error.message;
      toast.error(message, { icon: "⚠" });
      setPurchasing(false);
      return;
    }

    const result = data as {
      item_id: ShopItemId;
      points_spent: number;
      remaining_points: number;
    };

    setPurchasedIds((prev) => {
      if (isAdmin) return prev;
      return new Set([...prev, result.item_id]);
    });
    if (!isAdmin) {
      setPoints(result.remaining_points);
    }
    setSelectedItem(null);
    setPurchasing(false);
    toast.success(`${selectedItem.name} 구매 완료!`, { icon: "✓" });
    router.refresh();
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg text-indigo-300 pixel-glow mb-2">
            🛒 상점
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {isAdmin
              ? "어드민 테스트 모드 · 구매 수량 무한 · 포인트 미차감"
              : "계정당 1회 한정 구매 · 남은 수량 x1"}
          </p>
        </div>
        <div className="pixel-card px-4 py-3 inline-flex items-center gap-2 self-start">
          <span className="text-lg">⭐</span>
          <div>
            <div className="text-xs text-gray-500">보유 포인트</div>
            <div className="text-lg text-yellow-300">
              {isAdmin ? "∞" : `${points.toLocaleString("ko-KR")}pt`}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SHOP_ITEMS.map((item, index) => {
          const soldOut = !isAdmin && purchasedIds.has(item.id);
          const canAfford = isAdmin || points >= item.price;
          const stockLabel = isAdmin ? "∞" : soldOut ? "SOLD OUT" : "x1";

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`pixel-card border-2 p-4 flex flex-col gap-3 ${
                soldOut
                  ? "border-gray-700 bg-gray-950/80 opacity-80"
                  : "border-indigo-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-3xl">{item.emoji}</div>
                <div
                  className={`text-xs px-2 py-1 border ${
                    soldOut
                      ? "border-gray-600 text-gray-400 bg-gray-900"
                      : isAdmin
                      ? "border-yellow-700 text-yellow-300 bg-yellow-950/50"
                      : "border-green-700 text-green-300 bg-green-950/50"
                  }`}
                >
                  {stockLabel}
                </div>
              </div>

              <div>
                <div className="text-sm text-indigo-200 font-bold mb-1">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="text-sm text-yellow-300">
                  {formatShopPrice(item.price)}
                </div>
                <button
                  type="button"
                  disabled={soldOut || !canAfford || purchasing}
                  onClick={() => setSelectedItem(item)}
                  className={`pixel-btn text-xs px-3 py-2 ${
                    soldOut
                      ? "opacity-50 cursor-not-allowed border-gray-700 text-gray-500 bg-gray-900"
                      : !canAfford
                      ? "opacity-50 cursor-not-allowed border-gray-700 text-gray-500 bg-gray-900"
                      : "pixel-btn-primary"
                  }`}
                >
                  {soldOut ? "구매 완료" : !canAfford ? "포인트 부족" : "구매"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AlertDialog
        open={selectedItem !== null}
        onOpenChange={(open) => {
          if (!open && !purchasing) setSelectedItem(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상품을 구매할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem
                ? `${selectedItem.emoji} ${selectedItem.name}\n${formatShopPrice(selectedItem.price)}${isAdmin ? " · 어드민 테스트 (포인트 미차감)" : " · 계정당 1회 구매"}\n\n구매 후 포인트: ${isAdmin ? "∞" : `${(points - selectedItem.price).toLocaleString("ko-KR")}pt`}`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={purchasing}>취소</AlertDialogCancel>
            <button
              type="button"
              disabled={purchasing}
              className="pixel-btn pixel-btn-primary w-full sm:w-auto px-4 py-2 text-sm disabled:opacity-50"
              onClick={confirmPurchase}
            >
              {purchasing ? "구매 중..." : "구매하기"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
