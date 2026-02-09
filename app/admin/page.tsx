"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Inbox,
  Filter,
  FileText,
  AlertCircle,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import {
  getAllRequests,
  markAsIssued,
  deleteRequest,
} from "@/app/actions/admin";
import type { ShinroRequest, RequestStatus } from "@/lib/types";

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

export default function AdminPage() {
  const [requests, setRequests] = useState<ShinroRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">(
    "all"
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 通知を3秒後に自動消去
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleMarkIssued = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await markAsIssued(id);
      setNotification({
        type: result.success ? "success" : "error",
        message: result.message,
      });
      if (result.success) {
        await fetchData();
      }
    } catch {
      setNotification({ type: "error", message: "処理に失敗しました。" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この申請を削除しますか？")) return;

    setActionLoading(id);
    try {
      const result = await deleteRequest(id);
      setNotification({
        type: result.success ? "success" : "error",
        message: result.message,
      });
      if (result.success) {
        await fetchData();
      }
    } catch {
      setNotification({ type: "error", message: "削除に失敗しました。" });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const issuedCount = requests.filter((r) => r.status === "issued").length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理画面</h1>
          <p className="text-gray-500 mt-1">教員用：申請の管理と発行処理</p>
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

      {/* Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-success-light text-success"
              : "bg-danger-light text-danger"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <p className="font-medium text-sm">{notification.message}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          <p className="text-xs text-gray-500 mt-1">全申請数</p>
        </div>
        <div className="bg-warning-light rounded-xl border border-warning/20 p-4 text-center">
          <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          <p className="text-xs text-warning mt-1">申請中</p>
        </div>
        <div className="bg-success-light rounded-xl border border-success/20 p-4 text-center">
          <p className="text-2xl font-bold text-success">{issuedCount}</p>
          <p className="text-xs text-success mt-1">発行済</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1">
          {[
            { value: "all" as const, label: "すべて" },
            { value: "pending" as const, label: "申請中" },
            { value: "issued" as const, label: "発行済" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === opt.value
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRequests.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">申請がありません</p>
        </div>
      )}

      {/* Request Table */}
      {!loading && filteredRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    日時
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    生徒
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    書類
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">
                    部数
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">
                    金額
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">
                    状態
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {req.student_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {req.student_class} - {req.student_number}番
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span>{docTypeLabel(req.doc_type)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{req.quantity}部</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {req.total_fee.toLocaleString()}円
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {req.status === "pending" && (
                          <button
                            onClick={() => handleMarkIssued(req.id)}
                            disabled={actionLoading === req.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-success bg-success-light rounded-lg hover:bg-success/20 disabled:opacity-50 transition-colors"
                            title="発行済みにする"
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            発行
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(req.id)}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-danger bg-danger-light rounded-lg hover:bg-danger/20 disabled:opacity-50 transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
