"use client";

import { useState, useEffect } from "react";
import { Loader2, FileText, RefreshCw, Inbox } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { getMyRequests } from "@/app/actions/mypage";
import type { ShinroRequest } from "@/lib/types";

function docTypeLabel(docType: string): string {
  return docType === "survey_report" ? "調査書" : "学校推薦書";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyPage() {
  const [requests, setRequests] = useState<ShinroRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getMyRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
          <p className="text-gray-500 mt-1">申請履歴とステータスの確認</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          更新
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">申請履歴がありません</p>
          <p className="text-gray-400 text-sm mt-1">
            新規申請ページから書類を申請できます
          </p>
        </div>
      )}

      {/* Request List */}
      {!loading && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {docTypeLabel(req.doc_type)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(req.created_at)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">部数</p>
                  <p className="font-medium text-gray-900">{req.quantity}部</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">合計金額</p>
                  <p className="font-medium text-gray-900">
                    {req.total_fee.toLocaleString()}円
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">クラス・番号</p>
                  <p className="font-medium text-gray-900">
                    {req.student_class} - {req.student_number}番
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
