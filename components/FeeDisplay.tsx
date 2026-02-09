import type { FeeCalculationResult } from "@/lib/types";
import { Banknote, Gift } from "lucide-react";

interface FeeDisplayProps {
  feeResult: FeeCalculationResult | null;
  loading?: boolean;
}

export default function FeeDisplay({ feeResult, loading }: FeeDisplayProps) {
  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
      </div>
    );
  }

  if (!feeResult) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center text-gray-400">
        <Banknote className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">書類種別と部数を入力すると料金が表示されます</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-6 border-2 transition-all ${
        feeResult.freeApplied
          ? "bg-success-light border-success"
          : "bg-primary-light border-primary"
      }`}
    >
      {/* 合計金額 */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-1">合計金額</p>
        <p
          className={`text-4xl font-bold ${
            feeResult.freeApplied ? "text-success" : "text-primary"
          }`}
        >
          {feeResult.totalFee.toLocaleString()}
          <span className="text-lg ml-1">円</span>
        </p>
      </div>

      {/* 内訳 */}
      <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-1 text-sm text-gray-600">
        {feeResult.freeApplied && (
          <div className="flex items-center justify-center gap-1 text-success font-semibold">
            <Gift className="w-4 h-4" />
            <span>※ 初回無料適用（1通分）</span>
          </div>
        )}
        {feeResult.freeQuantity > 0 && (
          <p className="text-center">
            無料: {feeResult.freeQuantity}通 / 有料: {feeResult.paidQuantity}通
            × {feeResult.unitPrice}円
          </p>
        )}
        {feeResult.freeQuantity === 0 && feeResult.paidQuantity > 0 && (
          <p className="text-center">
            {feeResult.paidQuantity}通 × {feeResult.unitPrice}円
          </p>
        )}
      </div>
    </div>
  );
}
