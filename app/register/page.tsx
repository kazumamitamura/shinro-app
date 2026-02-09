"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  GraduationCap,
} from "lucide-react";
import { registerUser } from "@/app/actions/auth";
import { CLASS_OPTIONS, STUDENT_NUMBERS } from "@/lib/types";
import type { RegisterFormData } from "@/lib/types";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentNumber, setStudentNumber] = useState<number | "">("");
  const [studentName, setStudentName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    // パスワード確認
    if (password !== passwordConfirm) {
      setResult({
        success: false,
        message: "パスワードが一致しません。",
      });
      return;
    }

    if (password.length < 6) {
      setResult({
        success: false,
        message: "パスワードは6文字以上で入力してください。",
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData: RegisterFormData = {
        email,
        password,
        student_class: studentClass,
        student_number: Number(studentNumber),
        student_name: studentName,
      };

      const res = await registerUser(formData);
      setResult(res);
    } catch {
      setResult({
        success: false,
        message: "エラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    email &&
    password &&
    passwordConfirm &&
    studentClass &&
    studentNumber &&
    studentName;

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-light mb-4">
          <GraduationCap className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">新規登録</h1>
        <p className="text-gray-500 mt-1">
          進路書類申請システムのアカウントを作成します
        </p>
      </div>

      {/* 結果メッセージ */}
      {result && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
            result.success
              ? "bg-success-light text-success"
              : "bg-danger-light text-danger"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium text-sm">{result.message}</p>
            {result.success && (
              <p className="text-sm mt-2 opacity-80">
                メールが届かない場合は、迷惑メールフォルダを確認してください。
              </p>
            )}
          </div>
        </div>
      )}

      {/* 登録完了後はフォームを非表示 */}
      {result?.success ? (
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            ログインページへ →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* アカウント情報 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              アカウント情報
            </h2>
            <div className="space-y-4">
              {/* メールアドレス */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  メールアドレス <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@school.ac.jp"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* パスワード */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  パスワード <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6文字以上"
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* パスワード確認 */}
              <div>
                <label
                  htmlFor="password_confirm"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  パスワード（確認） <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password_confirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="パスワードを再入力"
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 生徒情報 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              生徒情報
            </h2>
            <div className="space-y-4">
              {/* クラス */}
              <div>
                <label
                  htmlFor="student_class"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  クラス <span className="text-danger">*</span>
                </label>
                <select
                  id="student_class"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  required
                >
                  <option value="">選択してください</option>
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 出席番号 */}
              <div>
                <label
                  htmlFor="student_number"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  出席番号 <span className="text-danger">*</span>
                </label>
                <select
                  id="student_number"
                  value={studentNumber}
                  onChange={(e) =>
                    setStudentNumber(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  required
                >
                  <option value="">選択してください</option>
                  {STUDENT_NUMBERS.map((n) => (
                    <option key={n} value={n}>
                      {n}番
                    </option>
                  ))}
                </select>
              </div>

              {/* 氏名 */}
              <div>
                <label
                  htmlFor="student_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  氏名 <span className="text-danger">*</span>
                </label>
                <input
                  id="student_name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="例: 田中 太郎"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* 登録ボタン */}
          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                登録中...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                登録する
              </>
            )}
          </button>

          {/* ログインリンク */}
          <p className="text-center text-sm text-gray-500">
            既にアカウントをお持ちですか？{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              ログイン
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
