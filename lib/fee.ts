import type { DocType, FeeCalculationResult } from "@/lib/types";

const UNIT_PRICE = 200; // 1通あたり200円

/**
 * 料金計算ロジック（クライアント側プレビュー & サーバーサイド確定共用）
 *
 * - 調査書 (survey_report):
 *   - 今年度はじめての申請で、かつ1通目は無料。2通目以降は200円/通。
 *   - 過去に申請履歴があれば全て200円/通。
 * - 学校推薦書 (recommendation):
 *   - 全て200円/通。
 *
 * @param docType      書類種別
 * @param quantity     希望部数
 * @param hasPriorSurveyRequest  過去に調査書の申請が存在するか
 */
export function calculateFee(
  docType: DocType,
  quantity: number,
  hasPriorSurveyRequest: boolean
): FeeCalculationResult {
  if (quantity <= 0) {
    return {
      totalFee: 0,
      freeApplied: false,
      freeQuantity: 0,
      paidQuantity: 0,
      unitPrice: UNIT_PRICE,
    };
  }

  // 学校推薦書は全て有料
  if (docType === "recommendation") {
    return {
      totalFee: quantity * UNIT_PRICE,
      freeApplied: false,
      freeQuantity: 0,
      paidQuantity: quantity,
      unitPrice: UNIT_PRICE,
    };
  }

  // 調査書: 初回の1通目が無料
  if (!hasPriorSurveyRequest) {
    const freeQuantity = 1;
    const paidQuantity = Math.max(0, quantity - freeQuantity);
    return {
      totalFee: paidQuantity * UNIT_PRICE,
      freeApplied: true,
      freeQuantity,
      paidQuantity,
      unitPrice: UNIT_PRICE,
    };
  }

  // 調査書だが過去に申請済み → 全て有料
  return {
    totalFee: quantity * UNIT_PRICE,
    freeApplied: false,
    freeQuantity: 0,
    paidQuantity: quantity,
    unitPrice: UNIT_PRICE,
  };
}
