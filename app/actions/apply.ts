"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateFee } from "@/lib/fee";
import {
  sendRequestNotificationToAdmin,
  sendRequestConfirmationToStudent,
} from "@/lib/email";
import type { ApplyFormData, ActionResult, DocType, ShinroRequest } from "@/lib/types";

/**
 * クライアント側のプレビュー用に、ユーザーが過去に調査書を申請したかチェックする
 */
export async function checkPriorSurveyRequest(): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // 今年度の開始日を計算（4月始まり）
  const now = new Date();
  const fiscalYearStart =
    now.getMonth() >= 3
      ? new Date(now.getFullYear(), 3, 1) // 4月1日〜
      : new Date(now.getFullYear() - 1, 3, 1);

  const { count } = await supabase
    .from("shinro_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("doc_type", "survey_report")
    .gte("created_at", fiscalYearStart.toISOString());

  return (count ?? 0) > 0;
}

/**
 * 料金プレビュー（クライアント側表示用）
 */
export async function previewFee(docType: DocType, quantity: number) {
  const hasPrior = await checkPriorSurveyRequest();
  return calculateFee(docType, quantity, hasPrior);
}

/**
 * 申請を送信する Server Action
 */
export async function submitRequest(
  formData: ApplyFormData
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  // ユーザー認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "ログインが必要です。",
    };
  }

  // バリデーション
  if (!formData.student_class || !formData.student_name) {
    return {
      success: false,
      message: "必須項目を入力してください。",
    };
  }

  if (formData.quantity <= 0 || formData.quantity > 10) {
    return {
      success: false,
      message: "部数は1〜10の間で指定してください。",
    };
  }

  // サーバーサイドで正しい料金を計算（改ざん防止）
  const hasPrior = await checkPriorSurveyRequest();
  const feeResult = calculateFee(formData.doc_type, formData.quantity, hasPrior);

  // DBに保存
  const { data, error } = await supabase
    .from("shinro_requests")
    .insert({
      user_id: user.id,
      student_class: formData.student_class,
      student_number: formData.student_number,
      student_name: formData.student_name,
      doc_type: formData.doc_type,
      quantity: formData.quantity,
      total_fee: feeResult.totalFee,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert request:", error);
    return {
      success: false,
      message: "申請の保存に失敗しました。もう一度お試しください。",
    };
  }

  const typedData = data as ShinroRequest;

  // メール送信（非同期で実行、失敗しても申請自体は成功とする）
  sendRequestNotificationToAdmin(typedData);

  // 生徒のメールアドレスを取得して確認メール送信
  if (user.email) {
    sendRequestConfirmationToStudent(user.email, typedData);
  }

  return {
    success: true,
    message: feeResult.freeApplied
      ? `申請が完了しました。（※初回無料適用 合計: ${feeResult.totalFee.toLocaleString()}円）`
      : `申請が完了しました。（合計: ${feeResult.totalFee.toLocaleString()}円）`,
    data: typedData,
  };
}
