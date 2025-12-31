"use client";

import { useEffect, useState } from "react";
import { tabunganApi, type Savings, type SavingsTransaction } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Eye,
  PiggyBank,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function TransaksiTabunganPage() {
  const { id } = useParams();
  const router = useRouter();
  const [savings, setSavings] = useState<Savings | null>(null);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [refreshLoading, setRefreshLoading] = useState(false);

  const savingsId = Number(id);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get savings detail
      const savingsRes = await tabunganApi.getById(savingsId);

      if (savingsRes.success) {
        setSavings(savingsRes.data ?? null);
      } else {
        console.error("Failed to fetch savings:", savingsRes.error);
        setError(savingsRes.error || "Gagal memuat data rekening");
        setSavings(null);
      }

      // Get transactions
      const transactionsRes = await tabunganApi.listTransactions(savingsId);

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data || []);
      } else {
        console.error(
          "❌ Failed to fetch transactions:",
          transactionsRes.error
        );
        setTransactions([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch data:", error);
      setError("Terjadi kesalahan saat memuat data");
      setSavings(null);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  useEffect(() => {
    if (savingsId) {
      fetchData();
    }
  }, [savingsId]);

  const handleRefresh = async () => {
    setRefreshLoading(true);
    await fetchData();
  };

  const handleApproveTransaction = async (
    transactionId: number,
    approve: boolean
  ) => {
    try {
      const result = await tabunganApi.approveTransaction(transactionId, {
        approve,
      });

      if (result.success) {
        alert(`Transaksi berhasil ${approve ? "disetujui" : "ditolak"}`);
        // Refresh data
        await fetchData();
      } else {
        alert(`Gagal memproses transaksi: ${result.error}`);
      }
    } catch (error: unknown) {
      console.error("Failed to approve transaction:", error);
      alert("Gagal memproses transaksi");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      INCOME: {
        color: "bg-green-100 text-green-800",
        icon: ArrowUp,
        label: "Setoran",
      },
      EXPENSE: {
        color: "bg-orange-100 text-orange-800",
        icon: ArrowDown,
        label: "Penarikan",
      },
    };

    const config =
      typeConfig[type as keyof typeof typeConfig] || typeConfig.INCOME;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME" && t.status === "APPROVED")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE" && t.status === "APPROVED")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Get santri name dengan fallback
  const getSantriName = () => {
    if (!savings) return "Loading...";

    if (savings.santri?.name) {
      return savings.santri.name;
    } else if (savings.santriName) {
      return savings.santriName;
    } else {
      return `Santri ${savings.santriId}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !savings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PiggyBank className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Rekening tidak ditemukan"}
          </h2>
          <p className="text-gray-600 mb-4">
            Rekening tabungan dengan ID #{savingsId} tidak dapat ditemukan.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              disabled={refreshLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshLoading ? "animate-spin" : ""}`}
              />
              Coba Lagi
            </button>
            <Link
              href="/tabungan"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center gap-4">
        <Link
          href="/tabungan"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-blue-600" />
            Transaksi Tabungan
          </h1>
          <p className="text-gray-600 mt-1">
            {getSantriName()} - Rekening #{savings.id}
          </p>
        </div>
        <Link
          href={`/tabungan/${savingsId}/transaksi/create`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-4 h-4" />
          Transaksi Baru
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Debug Info:</strong> Savings ID: {savings.id} • Santri ID:{" "}
            {savings.santriId} • Santri Name:{" "}
            {savings.santri?.name || "Not available"} • Transactions:{" "}
            {transactions.length}
          </p>
        </div>
      )} */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Saldo Saat Ini
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Setoran</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <ArrowUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Penarikan
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatCurrency(totalExpense)}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <ArrowDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Riwayat Transaksi
              </h2>
              <p className="text-gray-600 mt-1">
                {transactions.length} transaksi ditemukan
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleTimeString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(transaction.type)}
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}{" "}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{transaction.description}</p>
                    {transaction.proofUrl && (
                      <p className="text-sm text-blue-600 mt-1">
                        <a
                          href={transaction.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Lihat Bukti
                        </a>
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {transaction.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              handleApproveTransaction(transaction.id, true)
                            }
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() =>
                              handleApproveTransaction(transaction.id, false)
                            }
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition font-medium"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      {transaction.status !== "PENDING" && (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Belum ada transaksi</p>
            <Link
              href={`/tabungan/${savingsId}/transaksi/create`}
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Buat Transaksi Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
