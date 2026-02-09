-- ===== shinro_student_profiles テーブル =====
-- 生徒のプロフィール情報とメール認証状態を管理

CREATE TABLE IF NOT EXISTS public.shinro_student_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  student_class TEXT NOT NULL,
  student_number INTEGER NOT NULL CHECK (student_number >= 1 AND student_number <= 45),
  student_name TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT false NOT NULL,
  verification_token UUID DEFAULT gen_random_uuid() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shinro_student_profiles_user_id ON public.shinro_student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_shinro_student_profiles_verification_token ON public.shinro_student_profiles(verification_token);

ALTER TABLE public.shinro_student_profiles ENABLE ROW LEVEL SECURITY;

-- 生徒: 自分のプロフィールのみ閲覧可能
DROP POLICY IF EXISTS "Users can view their own profile" ON public.shinro_student_profiles;
CREATE POLICY "Users can view their own profile"
  ON public.shinro_student_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 生徒: 自分のプロフィールのみ挿入可能
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.shinro_student_profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.shinro_student_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 生徒: 自分のプロフィールのみ更新可能
DROP POLICY IF EXISTS "Users can update their own profile" ON public.shinro_student_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.shinro_student_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);


-- ===== shinro_requests テーブル =====
-- 進路書類申請データを管理するテーブル

CREATE TABLE IF NOT EXISTS public.shinro_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_class TEXT NOT NULL,
  student_number INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('survey_report', 'recommendation')),
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 10),
  total_fee INTEGER NOT NULL CHECK (total_fee >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'issued')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_shinro_requests_user_id ON public.shinro_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_shinro_requests_status ON public.shinro_requests(status);
CREATE INDEX IF NOT EXISTS idx_shinro_requests_created_at ON public.shinro_requests(created_at);

-- RLS (Row Level Security) ポリシー
ALTER TABLE public.shinro_requests ENABLE ROW LEVEL SECURITY;

-- 生徒: 自分のデータのみ閲覧可能
DROP POLICY IF EXISTS "Users can view their own requests" ON public.shinro_requests;
CREATE POLICY "Users can view their own requests"
  ON public.shinro_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- 生徒: 自分のデータのみ挿入可能
DROP POLICY IF EXISTS "Users can insert their own requests" ON public.shinro_requests;
CREATE POLICY "Users can insert their own requests"
  ON public.shinro_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 管理者（サービスロール）: 全データの閲覧・更新・削除が可能
-- ※ Supabase のサービスロールキーで操作する場合、RLS はバイパスされます。
-- ※ 教員用のRLSポリシーが必要な場合は、カスタムクレームやロールで制御してください。
