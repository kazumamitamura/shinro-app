import { Resend } from "resend";
import type { ShinroRequest } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const FROM_EMAIL = "shinro-app <onboarding@resend.dev>";

function docTypeLabel(docType: string): string {
  return docType === "survey_report" ? "調査書" : "学校推薦書";
}

/**
 * 申請受付メールを管理者へ送信
 */
export async function sendRequestNotificationToAdmin(
  request: ShinroRequest
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `【進路書類】新規申請: ${request.student_name}（${request.student_class}）`,
      html: `
        <h2>新しい書類申請がありました</h2>
        <table style="border-collapse:collapse; font-size:14px;">
          <tr><td style="padding:4px 12px; font-weight:bold;">生徒氏名</td><td>${request.student_name}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">クラス</td><td>${request.student_class}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">出席番号</td><td>${request.student_number}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">書類種別</td><td>${docTypeLabel(request.doc_type)}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">部数</td><td>${request.quantity}部</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">合計金額</td><td>${request.total_fee.toLocaleString()}円</td></tr>
        </table>
        <p style="margin-top:16px; color:#666;">管理画面から確認してください。</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
  }
}

/**
 * 申請受付確認メールを生徒へ送信（メールアドレスが取得できる場合）
 */
export async function sendRequestConfirmationToStudent(
  email: string,
  request: ShinroRequest
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `【進路書類】申請を受け付けました - ${docTypeLabel(request.doc_type)}`,
      html: `
        <h2>書類申請を受け付けました</h2>
        <p>${request.student_name} さん</p>
        <p>以下の内容で申請を受け付けました。発行完了まで少々お待ちください。</p>
        <table style="border-collapse:collapse; font-size:14px;">
          <tr><td style="padding:4px 12px; font-weight:bold;">書類種別</td><td>${docTypeLabel(request.doc_type)}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">部数</td><td>${request.quantity}部</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">合計金額</td><td>${request.total_fee.toLocaleString()}円</td></tr>
        </table>
      `,
    });
  } catch (error) {
    console.error("Failed to send student confirmation email:", error);
  }
}

/**
 * 発行完了メールを生徒へ送信
 */
export async function sendIssuedNotificationToStudent(
  email: string,
  request: ShinroRequest
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `【進路書類】発行が完了しました - ${docTypeLabel(request.doc_type)}`,
      html: `
        <h2>書類の発行が完了しました</h2>
        <p>${request.student_name} さん</p>
        <p>申請された書類の発行が完了しました。担当の先生から受け取ってください。</p>
        <table style="border-collapse:collapse; font-size:14px;">
          <tr><td style="padding:4px 12px; font-weight:bold;">書類種別</td><td>${docTypeLabel(request.doc_type)}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">部数</td><td>${request.quantity}部</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">合計金額</td><td>${request.total_fee.toLocaleString()}円</td></tr>
        </table>
      `,
    });
  } catch (error) {
    console.error("Failed to send issued notification email:", error);
  }
}
