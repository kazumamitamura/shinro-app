"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ShinroRequest } from "@/lib/types";

/**
 * ログインユーザーの申請履歴を取得
 */
export async function getMyRequests(): Promise<ShinroRequest[]> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("shinro_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch user requests:", error);
    return [];
  }

  return (data as ShinroRequest[]) ?? [];
}
