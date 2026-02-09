import { Resend } from "resend";
import type { ShinroRequest } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const FROM_EMAIL =
  process.env.RESEND_FROM || "進路書類申請システム <onboarding@resend.dev>";

function docTypeLabel(docType: string): string {
  return docType === "survey_report" ? "調査書" : "学校推薦書";
}

// ===== メール共通スタイル =====
const emailStyles = {
  container:
    'max-width:520px;margin:0 auto;font-family:"Hiragino Sans","Noto Sans JP",sans-serif;',
  header:
    "background:#2563eb;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;",
  body: "background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;",
  table:
    "width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;",
  thCell:
    "padding:8px 12px;text-align:left;font-weight:600;background:#f9fafb;border:1px solid #e5e7eb;width:120px;",
  tdCell: "padding:8px 12px;border:1px solid #e5e7eb;",
  button:
    "display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:16px;",
  footer: "margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;",
};

/**
 * 新規登録 メール認証リンクを送信
 */
export async function sendVerificationEmail(
  email: string,
  studentName: string,
  verifyUrl: string
): Promise<void> {
  try {
    console.log("[Email] Sending verification email:", {
      to: email,
      from: FROM_EMAIL,
      apiKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 10) + "...",
    });
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "【進路書類申請】メールアドレスの確認",
      html: `
        <div style="${emailStyles.container}">
          <div style="${emailStyles.header}">
            <h2 style="margin:0;font-size:18px;">メールアドレスの確認</h2>
          </div>
          <div style="${emailStyles.body}">
            <p>${studentName} さん</p>
            <p>進路書類申請システムへの登録ありがとうございます。</p>
            <p>以下のボタンをクリックして、メールアドレスの確認を完了してください。</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${verifyUrl}" style="${emailStyles.button}">
                メールアドレスを確認する
              </a>
            </div>
            <p style="color:#6b7280;font-size:13px;">
              ボタンが動作しない場合は、以下のURLをブラウザに直接貼り付けてください：<br/>
              <a href="${verifyUrl}" style="color:#2563eb;word-break:break-all;">${verifyUrl}</a>
            </p>
            <div style="${emailStyles.footer}">
              <p>このメールに心当たりがない場合は無視してください。</p>
            </div>
          </div>
        </div>
      `,
    });
    if (error) {
      console.error("[Email] Resend API error (verification):", JSON.stringify(error));
    } else {
      console.log("[Email] Verification email sent successfully:", data);
    }
  } catch (error) {
    console.error("[Email] Failed to send verification email:", error);
  }
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
        <div style="${emailStyles.container}">
          <div style="${emailStyles.header}">
            <h2 style="margin:0;font-size:18px;">新しい書類申請</h2>
          </div>
          <div style="${emailStyles.body}">
            <p>新しい書類申請がありました。</p>
            <table style="${emailStyles.table}">
              <tr><th style="${emailStyles.thCell}">生徒氏名</th><td style="${emailStyles.tdCell}">${request.student_name}</td></tr>
              <tr><th style="${emailStyles.thCell}">クラス</th><td style="${emailStyles.tdCell}">${request.student_class}</td></tr>
              <tr><th style="${emailStyles.thCell}">出席番号</th><td style="${emailStyles.tdCell}">${request.student_number}番</td></tr>
              <tr><th style="${emailStyles.thCell}">書類種別</th><td style="${emailStyles.tdCell}">${docTypeLabel(request.doc_type)}</td></tr>
              <tr><th style="${emailStyles.thCell}">部数</th><td style="${emailStyles.tdCell}">${request.quantity}部</td></tr>
              <tr><th style="${emailStyles.thCell}">合計金額</th><td style="${emailStyles.tdCell}"><strong>${request.total_fee.toLocaleString()}円</strong></td></tr>
            </table>
            <p style="color:#6b7280;">管理画面から確認してください。</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
  }
}

/**
 * 申請受付確認メールを生徒へ送信（何をいくら申請したかの詳細つき）
 */
export async function sendRequestConfirmationToStudent(
  email: string,
  request: ShinroRequest,
  freeApplied: boolean = false
): Promise<void> {
  try {
    const freeNote = freeApplied
      ? '<p style="color:#16a34a;font-weight:600;margin:12px 0;">※ 初回無料（1通分）が適用されています</p>'
      : "";

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `【進路書類】申請を受け付けました - ${docTypeLabel(request.doc_type)}`,
      html: `
        <div style="${emailStyles.container}">
          <div style="${emailStyles.header}">
            <h2 style="margin:0;font-size:18px;">書類申請の受付確認</h2>
          </div>
          <div style="${emailStyles.body}">
            <p>${request.student_name} さん</p>
            <p>以下の内容で書類申請を受け付けました。発行完了まで少々お待ちください。</p>
            <table style="${emailStyles.table}">
              <tr><th style="${emailStyles.thCell}">書類種別</th><td style="${emailStyles.tdCell}">${docTypeLabel(request.doc_type)}</td></tr>
              <tr><th style="${emailStyles.thCell}">部数</th><td style="${emailStyles.tdCell}">${request.quantity}部</td></tr>
              <tr>
                <th style="${emailStyles.thCell}">合計金額</th>
                <td style="${emailStyles.tdCell}">
                  <strong style="font-size:18px;color:#2563eb;">${request.total_fee.toLocaleString()}円</strong>
                </td>
              </tr>
            </table>
            ${freeNote}
            <p style="color:#6b7280;font-size:13px;">
              書類が発行されましたら、改めてメールでお知らせします。
            </p>
            <div style="${emailStyles.footer}">
              <p>このメールは進路書類申請システムから自動送信されています。</p>
            </div>
          </div>
        </div>
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
        <div style="${emailStyles.container}">
          <div style="${emailStyles.header}; background:#16a34a;">
            <h2 style="margin:0;font-size:18px;">書類の発行が完了しました</h2>
          </div>
          <div style="${emailStyles.body}">
            <p>${request.student_name} さん</p>
            <p>申請された書類の発行が完了しました。<br/>担当の先生から受け取ってください。</p>
            <table style="${emailStyles.table}">
              <tr><th style="${emailStyles.thCell}">書類種別</th><td style="${emailStyles.tdCell}">${docTypeLabel(request.doc_type)}</td></tr>
              <tr><th style="${emailStyles.thCell}">部数</th><td style="${emailStyles.tdCell}">${request.quantity}部</td></tr>
              <tr><th style="${emailStyles.thCell}">合計金額</th><td style="${emailStyles.tdCell}"><strong>${request.total_fee.toLocaleString()}円</strong></td></tr>
            </table>
            <div style="${emailStyles.footer}">
              <p>このメールは進路書類申請システムから自動送信されています。</p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send issued notification email:", error);
  }
}
