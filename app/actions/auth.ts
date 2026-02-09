"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendVerificationEmail } from "@/lib/email";
import type { RegisterFormData, StudentProfile } from "@/lib/types";
import { redirect } from "next/navigation";

/**
 * 新規ユーザー登録
 */
export async function registerUser(
  formData: RegisterFormData
): Promise<{ success: boolean; message: string }> {
  const supabase = await createServerSupabaseClient();

  // 1. Supabase Auth でユーザー作成
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (authError) {
    console.error("Registration error:", authError);
    if (authError.message.includes("already registered")) {
      return {
        success: false,
        message: "このメールアドレスは既に登録されています。",
      };
    }
    return {
      success: false,
      message: `登録に失敗しました: ${authError.message}`,
    };
  }

  if (!authData.user) {
    return {
      success: false,
      message: "ユーザーの作成に失敗しました。",
    };
  }

  // 2. student_profiles テーブルにプロフィールを保存
  const { data: profile, error: profileError } = await supabase
    .from("shinro_student_profiles")
    .insert({
      user_id: authData.user.id,
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

  // 3. Resend で認証メールを送信
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
