"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { financeApi, type FinanceTransaction } from "@/lib/finance-api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  FileText,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function FinanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<FinanceTransaction | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transactionId = Number(params.id);

  useEffect(() => {
    if (transactionId) {
      loadTransaction();
    }
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await financeApi.get(transactionId);

      if (result.success && result.data) {
        setTransaction(result.data);
      } else {
        setError(result.error || "Failed to load transaction");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!user?.id) {
      alert("User ID tidak ditemukan");
      return;
    }

    try {
      setActionLoading(true);
      const result = await financeApi.approve(transactionId, user.id);

      if (result.success && result.data) {
        setTransaction(result.data);
        alert("Transaksi berhasil disetujui");
      } else {
        alert(result.error || "Gagal menyetujui transaksi");
      }
    } catch (error) {
      console.error("Approve error:", error);
      alert("Terjadi kesalahan saat menyetujui transaksi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user?.id) {
      alert("User ID tidak ditemukan");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menolak transaksi ini?")) {
      return;
    }

    try {
      setActionLoading(true);
      const result = await financeApi.reject(transactionId, user.id);

      if (result.success && result.data) {
        setTransaction(result.data);
        alert("Transaksi berhasil ditolak");
      } else {
        alert(result.error || "Gagal menolak transaksi");
      }
    } catch (error) {
      console.error("Reject error:", error);
      alert("Terjadi kesalahan saat menolak transaksi");
    } finally {
      setActionLoading(false);
    }
  };

  // Check if user has permission to approve/reject
  const canApproveReject =
    user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    const config = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending",
      },
      APPROVED: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Disetujui",
      },
      REJECTED: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Ditolak",
      },
    };
    return config[status as keyof typeof config] || config.PENDING;
  };

  const getTypeConfig = (type: string) => {
    const config = {
      INCOME: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: TrendingUp,
        label: "Pendapatan",
      },
      EXPENSE: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: TrendingDown,
        label: "Pengeluaran",
      },
    };
    return config[type as keyof typeof config];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={loadTransaction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Coba Lagi
              </button>
              <Link
                href="/finance"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Transaksi Tidak Ditemukan
          </h3>
          <p className="text-gray-600 mb-4">
            Transaksi dengan ID {transactionId} tidak ditemukan
          </p>
          <Link
            href="/finance"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(transaction.status);
  const typeConfig = getTypeConfig(transaction.type);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/finance"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-7 h-7 text-blue-600" />
              Detail Transaksi
            </h1>
            <p className="text-gray-600 mt-1">
              Informasi lengkap transaksi keuangan
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${statusConfig.color}`}
          >
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </span>
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${typeConfig.color}`}
          >
            <TypeIcon className="w-4 h-4" />
            {typeConfig.label}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Jumlah Transaksi
              </p>
              <p
                className={`text-4xl font-bold ${
                  transaction.type === "INCOME"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(Number(transaction.amount))}
              </p>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Transaksi
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Kategori</span>
                <span className="font-medium text-gray-900">
                  {transaction.category}
                </span>
              </div>

              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600">Deskripsi</span>
                <span className="font-medium text-gray-900 text-right">
                  {transaction.description || "-"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Dibuat Pada</span>
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="w-4 h-4" />
                  {formatDate(transaction.createdAt)}
                </div>
              </div>

              {transaction.updatedAt !== transaction.createdAt && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Diupdate Pada</span>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    {formatDate(transaction.updatedAt)}
                  </div>
                </div>
              )}

              {transaction.createdBy && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Dibuat Oleh</span>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="w-4 h-4" />
                    User ID: {transaction.createdBy}
                  </div>
                </div>
              )}

              {transaction.approvedBy && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Disetujui Oleh</span>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="w-4 h-4" />
                    User ID: {transaction.approvedBy}
                  </div>
                </div>
              )}

              {transaction.approvedAt && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Disetujui Pada</span>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    {formatDate(transaction.approvedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Proof Document */}
          {transaction.proofUrl && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bukti Transaksi
              </h3>
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">
                  Dokumen bukti tersedia
                </p>
                <a
                  href={transaction.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Download className="w-4 h-4" />
                  Lihat Bukti
                </a>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi</h3>
            <div className="space-y-3">
              <button
                onClick={loadTransaction}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>

              {/* Approve/Reject Buttons - hanya untuk ADMIN/SUPERADMIN dan status PENDING */}
              {canApproveReject && transaction.status === "PENDING" && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Setujui Transaksi
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Tolak Transaksi
                  </button>
                </>
              )}

              <Link
                href="/finance"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
