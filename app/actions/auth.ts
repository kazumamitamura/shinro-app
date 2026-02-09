"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendVerificationEmail } from "@/lib/email";
import type { RegisterFormData, StudentProfile } from "@/lib/types";
import { redirect } from "next/navigation";

/**
 * shinro_student_profiles に進路アプリ用プロフィールを作成し、認証メールを送信する。
 * admin クライアントを使用して RLS を回避。
 */
async function createShinroProfile(
  userId: string,
  formData: RegisterFormData
): Promise<{ success: boolean; message: string }> {
  const adminSupabase = createAdminSupabaseClient();

  // 既に shinro 用プロフィールが存在するかチェック
  const { data: existing } = await adminSupabase
    .from("shinro_student_profiles")
    .select("id, email_verified")
    .eq("user_id", userId)
    .single();

  if (existing) {
    if ((existing as { email_verified: boolean }).email_verified) {
      return {
        success: false,
        message:
          "このアカウントは既に進路書類申請システムに登録済みです。ログインしてください。",
      };
    }
    // 未認証のプロフィールが残っている → 認証メール再送
    const typedExisting = existing as StudentProfile;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/verify?token=${typedExisting.verification_token}`;
    await sendVerificationEmail(formData.email, formData.student_name, verifyUrl);
    return {
      success: true,
      message:
        "認証メールを再送しました。メールに届いたリンクをクリックして登録を完了してください。",
    };
  }

  // 新規プロフィール作成
  const { data: profile, error: profileError } = await adminSupabase
    .from("shinro_student_profiles")
    .insert({
      user_id: userId,
      email: formData.email,
      student_class: formData.student_class,
      student_number: formData.student_number,
      student_name: formData.student_name,
      email_verified: false,
    })
    .select()
    .single();

  if (profileError) {
    console.error("Profile creation error:", profileError);
    return {
      success: false,
      message: "プロフィールの保存に失敗しました。",
    };
  }

  const typedProfile = profile as StudentProfile;

  // 認証メールを送信
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/api/verify?token=${typedProfile.verification_token}`;
  await sendVerificationEmail(formData.email, formData.student_name, verifyUrl);

  return {
    success: true,
    message:
      "登録を受け付けました。メールに届いた認証リンクをクリックして登録を完了してください。",
  };
}

/**
 * 新規ユーザー登録
 *
 * フロー:
 *  A) auth.users に未登録 → signUp → shinro プロフィール作成 → 認証メール送信
 *  B) auth.users に登録済み（他アプリで使用中）→ パスワードで認証
 *     → shinro プロフィールが無ければ作成 → 認証メール送信
 */
export async function registerUser(
  formData: RegisterFormData
): Promise<{ success: boolean; message: string }> {
  const supabase = await createServerSupabaseClient();

  // ── パターン A: 新規ユーザーとして signUp を試みる ──
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  // signUp 成功（新規ユーザー）
  if (!authError && authData.user) {
    return createShinroProfile(authData.user.id, formData);
  }

  // ── パターン B: 既に auth.users に存在する → ログインを試みる ──
  if (authError?.message?.includes("already registered")) {
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

    if (loginError || !loginData.user) {
      return {
        success: false,
        message:
          "このメールアドレスは他のアプリで登録済みです。同じパスワードを入力して進路アプリ用プロフィールを作成してください。",
      };
    }

    // ログイン成功 → shinro プロフィールを作成
    return createShinroProfile(loginData.user.id, formData);
  }

  // その他のエラー
  console.error("Registration error:", authError);
  return {
    success: false,
    message: `登録に失敗しました: ${authError?.message || "不明なエラー"}`,
  };
}

/**
 * ログイン
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "メールアドレスまたはパスワードが正しくありません。",
    };
  }

  return {
    success: true,
    message: "ログインしました。",
  };
}

/**
 * ログアウト
 */
export async function logoutUser(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * 現在ログインしているユーザーのプロフィールを取得
 */
export async function getStudentProfile(): Promise<StudentProfile | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("shinro_student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  return data as StudentProfile;
}

/**
 * 現在のログインユーザー情報を取得（軽量）
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * メール認証トークンを検証して認証を完了する（管理者クライアント使用）
 */
export async function verifyEmailToken(
  token: string
): Promise<{ success: boolean; message: string }> {
  const adminSupabase = createAdminSupabaseClient();

  // トークンでプロフィールを検索
  const { data: profile, error } = await adminSupabase
    .from("shinro_student_profiles")
    .select("*")
    .eq("verification_token", token)
    .eq("email_verified", false)
    .single();

  if (error || !profile) {
    return {
      success: false,
      message: "無効な認証リンクです。既に認証済みか、リンクが正しくありません。",
    };
  }

  // 認証完了に更新
  const { error: updateError } = await adminSupabase
    .from("shinro_student_profiles")
    .update({ email_verified: true })
    .eq("id", profile.id);

  if (updateError) {
    console.error("Verification update error:", updateError);
    return {
      success: false,
      message: "認証の更新に失敗しました。",
    };
  }

  return {
    success: true,
    message: "メール認証が完了しました。ログインしてご利用ください。",
  };
}
