"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import FeeDisplay from "@/components/FeeDisplay";
import { previewFee, submitRequest } from "@/app/actions/apply";
import type { DocType, FeeCalculationResult, ApplyFormData } from "@/lib/types";
import { calculateFee } from "@/lib/fee";

const CLASS_OPTIONS = [
  "3-1",
  "3-2",
  "3-3",
  "3-4",
  "3-5",
  "3-6",
  "3-7",
  "3-8",
];

export default function ApplyPage() {
  const router = useRouter();

  // Form state
  const [studentClass, setStudentClass] = useState("");
  const [studentNumber, setStudentNumber] = useState<number | "">("");
  const [studentName, setStudentName] = useState("");
  const [docType, setDocType] = useState<DocType | "">("");
  const [quantity, setQuantity] = useState<number | "">(1);

  // Fee state
  const [feeResult, setFeeResult] = useState<FeeCalculationResult | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [hasPriorSurvey, setHasPriorSurvey] = useState<boolean | null>(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 初回ロード: 過去の調査書申請を確認
  useEffect(() => {
    previewFee("survey_report", 0).then(() => {
      // We just need to check hasPriorSurveyRequest - we'll do it via previewFee
    });
  }, []);

  // リアルタイム料金計算
  const updateFee = useCallback(
    async (dt: DocType | "", qty: number | "") => {
      if (!dt || !qty || qty <= 0) {
        setFeeResult(null);
        return;
      }

      // まずクライアントサイドでプレビュー表示（高速）
      if (hasPriorSurvey !== null) {
        const clientResult = calculateFee(dt, qty, hasPriorSurvey);
        setFeeResult(clientResult);
      }

      // サーバーから正確な計算を取得
      setFeeLoading(true);
      try {
        const result = await previewFee(dt, qty);
        setFeeResult(result);
        setHasPriorSurvey(
          dt === "survey_report" ? !result.freeApplied : hasPriorSurvey
        );
      } catch {
        // クライアントサイド計算のフォールバックを使用
      } finally {
        setFeeLoading(false);
      }
    },
    [hasPriorSurvey]
  );

  // doc_type or quantity が変更されたら料金を再計算
  useEffect(() => {
    updateFee(docType, quantity);
  }, [docType, quantity, updateFee]);

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    const formData: ApplyFormData = {
      student_class: studentClass,
      student_number: Number(studentNumber),
      student_name: studentName,
      doc_type: docType as DocType,
      quantity: Number(quantity),
    };

    try {
      const result = await submitRequest(formData);
      setSubmitResult(result);

      if (result.success) {
        // 3秒後にマイページへ遷移
        setTimeout(() => router.push("/mypage"), 3000);
      }
    } catch {
      setSubmitResult({
        success: false,
        message: "エラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    studentClass &&
    studentNumber &&
    studentName &&
    docType &&
    quantity &&
    Number(quantity) > 0;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">新規申請</h1>
        <p className="text-gray-500 mt-1">
          調査書・学校推薦書の発行を申請します
        </p>
      </div>

      {/* 成功・エラーメッセージ */}
      {submitResult && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
            submitResult.success
              ? "bg-success-light text-success"
              : "bg-danger-light text-danger"
          }`}
        >
          {submitResult.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium">{submitResult.message}</p>
            {submitResult.success && (
              <p className="text-sm mt-1 opacity-80">
                3秒後にマイページへ移動します...
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* カード: 生徒情報 */}
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
              <input
                id="student_number"
                type="number"
                min={1}
                max={50}
                value={studentNumber}
                onChange={(e) =>
                  setStudentNumber(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="例: 15"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* 生徒氏名 */}
            <div>
              <label
                htmlFor="student_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                生徒氏名 <span className="text-danger">*</span>
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

        {/* カード: 書類情報 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            書類情報
          </h2>
          <div className="space-y-4">
            {/* 書類種別 */}
            <div>
              <label
                htmlFor="doc_type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                書類種別 <span className="text-danger">*</span>
              </label>
              <select
                id="doc_type"
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocType | "")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                required
              >
                <option value="">選択してください</option>
                <option value="survey_report">調査書</option>
                <option value="recommendation">学校推薦書</option>
              </select>
            </div>

            {/* 部数 */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                部数 <span className="text-danger">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* 料金表示 */}
        <FeeDisplay feeResult={feeResult} loading={feeLoading} />

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={!isFormValid || submitting || submitResult?.success}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              申請する
            </>
          )}
        </button>
      </form>
    </div>
  );
}
