"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  calculateRefundAmount,
  formatInventoryDate,
  type InventoryItem,
} from "@/lib/inventory";
import { formatShopPrice } from "@/lib/shop";
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

interface InventoryClientProps {
  items: InventoryItem[];
}

export default function InventoryClient({ items: initialItems }: InventoryClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [refunding, setRefunding] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.count, 0);

  async function handleRefund() {
    if (!selectedItem) return;

    setRefunding(true);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("refund_shop_item", {
      p_item_id: selectedItem.itemId,
    });

    if (error) {
      toast.error(error.message, { icon: "⚠" });
      setRefunding(false);
      return;
    }

    const result = data as {
      item_id: string;
      refund_amount: number;
      remaining_count: number;
    };

    setItems((prev) => {
      if (result.remaining_count <= 0) {
        return prev.filter((item) => item.itemId !== selectedItem.itemId);
      }

      return prev.map((item) =>
        item.itemId === selectedItem.itemId
          ? { ...item, count: result.remaining_count }
          : item
      );
    });

    setSelectedItem(null);
    setRefunding(false);
    toast.success(
      `${selectedItem.name} 환불 완료 (+${result.refund_amount.toLocaleString("ko-KR")}pt)`,
      { icon: "✓" }
    );
    router.refresh();
  }

  function handleUse() {
    if (!selectedItem) return;

    toast.info("텔레그램 알림 연동은 준비 중입니다.", {
      icon: "📨",
      description: `${selectedItem.name} 사용 요청은 곧 지원될 예정입니다.`,
    });
    setSelectedItem(null);
  }

  const refundAmount = selectedItem
    ? calculateRefundAmount(selectedItem.latestPurchasePoints)
    : 0;

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg text-indigo-300 pixel-glow mb-2">
            🎒 인벤토리
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            아이템을 눌러 사용하거나 환불할 수 있습니다
          </p>
        </div>
        <div className="pixel-card px-4 py-3 inline-flex items-center gap-2 self-start">
          <span className="text-lg">📦</span>
          <div>
            <div className="text-xs text-gray-500">보유 아이템</div>
            <div className="text-lg text-green-300">{totalItems}개</div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="pixel-card text-center py-12">
          <div className="text-4xl mb-4">🎒</div>
          <div className="text-sm text-gray-400 mb-2">아직 보유한 아이템이 없습니다</div>
          <div className="text-xs text-gray-600 mb-6">
            상점에서 포인트로 아이템을 구매해 보세요
          </div>
          <Link href="/shop" className="pixel-btn pixel-btn-primary text-sm px-6 py-3">
            🛒 상점으로 이동
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, index) => (
            <motion.button
              key={item.itemId}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => setSelectedItem(item)}
              className="pixel-card border-2 border-green-800 p-4 flex flex-col gap-3 text-left transition-colors hover:border-green-600 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-3xl">{item.emoji}</div>
                <div className="text-xs px-2 py-1 border border-green-700 text-green-300 bg-green-950/50">
                  x{item.count}
                </div>
              </div>

              <div>
                <div className="text-sm text-indigo-200 font-bold mb-1">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>

              <div className="mt-auto text-xs text-gray-600">
                {item.count > 1 ? "최근 획득" : "획득"} ·{" "}
                {formatInventoryDate(item.lastPurchasedAt)}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AlertDialog
        open={selectedItem !== null}
        onOpenChange={(open) => {
          if (!open && !refunding) setSelectedItem(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedItem ? `${selectedItem.emoji} ${selectedItem.name}` : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem
                ? `${selectedItem.description}\n보유 수량: x${selectedItem.count}\n구매가: ${formatShopPrice(selectedItem.latestPurchasePoints)}\n환불 예상: +${refundAmount.toLocaleString("ko-KR")}pt (80%)`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-between">
            <AlertDialogCancel disabled={refunding}>닫기</AlertDialogCancel>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={refunding}
                onClick={handleUse}
                className="pixel-btn pixel-btn-primary w-full sm:w-auto px-4 py-2 text-sm disabled:opacity-50"
              >
                사용
              </button>
              <button
                type="button"
                disabled={refunding}
                onClick={handleRefund}
                className="pixel-btn w-full sm:w-auto px-4 py-2 text-sm border-2 border-orange-600 bg-orange-950 text-orange-200 hover:brightness-110 disabled:opacity-50"
              >
                {refunding
                  ? "환불 중..."
                  : `환불 (+${refundAmount.toLocaleString("ko-KR")}pt)`}
              </button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
