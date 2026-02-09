import { createClient } from "@supabase/supabase-js";

/**
 * サービスロールキーを使用した管理者用 Supabase クライアント
 * RLS をバイパスし、メール認証の確認などに使用
 */
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
