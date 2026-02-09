"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendIssuedNotificationToStudent } from "@/lib/email";
import type { ShinroRequest, ActionResult } from "@/lib/types";

/**
 * 全ての申請一覧を取得（管理者用）
 */
export async function getAllRequests(): Promise<ShinroRequest[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("shinro_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch requests:", error);
    return [];
  }

  return (data as ShinroRequest[]) ?? [];
}

/**
 * ステータスを「発行済」に変更する
 */
export async function markAsIssued(requestId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  // リクエストを取得
  const { data: request, error: fetchError } = await supabase
    .from("shinro_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return {
      success: false,
      message: "申請が見つかりませんでした。",
    };
  }

  const typedRequest = request as ShinroRequest;

  // ステータス更新
  const { error: updateError } = await supabase
    .from("shinro_requests")
    .update({ status: "issued" })
    .eq("id", requestId);

  if (updateError) {
    console.error("Failed to update status:", updateError);
    return {
      success: false,
      message: "ステータスの更新に失敗しました。",
    };
  }

  // 生徒のメールアドレスを取得して発行完了メールを送信
  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(typedRequest.user_id);

  if (user?.email) {
    sendIssuedNotificationToStudent(user.email, {
      ...typedRequest,
      status: "issued",
    });
  }

  return {
    success: true,
    message: "発行済みに更新しました。",
  };
}

/**
 * 申請を削除する（管理者用）
 */
export async function deleteRequest(requestId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("shinro_requests")
    .delete()
    .eq("id", requestId);

  if (error) {
    console.error("Failed to delete request:", error);
    return {
      success: false,
      message: "削除に失敗しました。",
    };
  }

  return {
    success: true,
    message: "申請を削除しました。",
  };
}
