"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LogIn,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  GraduationCap,
} from "lucide-react";
import { loginUser } from "@/app/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/apply";
  const verified = searchParams.get("verified");
  const verifyError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    verifyError === "verification_failed"
      ? "認証リンクが無効です。既に認証済みか、リンクが正しくありません。"
      : verifyError === "invalid_token"
        ? "認証リンクが無効です。"
        : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await loginUser(email, password);

      if (result.success) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 認証完了メッセージ */}
      {verified && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-success-light text-success">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium text-sm">
            メール認証が完了しました。ログインしてご利用ください。
          </p>
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-danger-light text-danger">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          {/* メールアドレス */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              メールアドレス
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
                autoFocus
              />
            </div>
          </div>

          {/* パスワード */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* ログインボタン */}
        <button
          type="submit"
          disabled={!email || !password || submitting}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              ログイン中...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              ログイン
            </>
          )}
        </button>

        {/* 登録リンク */}
        <p className="text-center text-sm text-gray-500">
          アカウントをお持ちでないですか？{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            新規登録
          </Link>
        </p>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-light mb-4">
          <GraduationCap className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
        <p className="text-gray-500 mt-1">
          進路書類申請システムにログインします
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
