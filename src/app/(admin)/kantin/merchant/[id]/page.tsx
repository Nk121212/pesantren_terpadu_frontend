"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { canteenApi, type Merchant, type CanteenTransaction } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  CreditCard,
  Users,
  Calendar,
  RefreshCw,
} from "lucide-react";

export default function MerchantDetailPage() {
  const params = useParams();
  const merchantId = parseInt(params.id as string);

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [transactions, setTransactions] = useState<CanteenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (merchantId && !isNaN(merchantId)) {
      loadMerchantData();
    } else {
      setError("ID merchant tidak valid");
      setLoading(false);
    }
  }, [merchantId]);

  const loadMerchantData = async () => {
    try {
      setLoading(true);
      setError("");

      const [merchantRes, transactionsRes] = await Promise.all([
        canteenApi.getMerchant(merchantId),
        canteenApi.listTransactions(merchantId),
      ]);

      if (merchantRes.success && merchantRes.data) {
        setMerchant(merchantRes.data);
      } else {
        setError(merchantRes.error || "Gagal memuat data merchant");
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data || []);
      }
    } catch (err) {
      console.error("Error loading merchant data:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (amount === null || amount === undefined) return "Rp 0";

    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return "Rp 0";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return "-";
      }

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        label: "Pending",
      },
      APPROVED: {
        color: "bg-green-100 text-green-800 border border-green-200",
        label: "Sukses",
      },
      REJECTED: {
        color: "bg-red-100 text-red-800 border border-red-200",
        label: "Ditolak",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      QRIS: {
        color: "bg-purple-100 text-purple-800 border border-purple-200",
        label: "QRIS",
      },
      VA: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        label: "Virtual Account",
      },
      EWALLET: {
        color: "bg-orange-100 text-orange-800 border border-orange-200",
        label: "E-Wallet",
      },
      BANK_TRANSFER: {
        color: "bg-green-100 text-green-800 border border-green-200",
        label: "Bank Transfer",
      },
    };

    const config =
      methodConfig[method as keyof typeof methodConfig] || methodConfig.QRIS;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data merchant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link
            href="/kantin"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="text-center">
            <Store className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Gagal Memuat Data
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadMerchantData}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link
            href="/kantin"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Merchant Tidak Ditemukan
            </h1>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <Store className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-yellow-800 mb-4">
            Merchant dengan ID {merchantId} tidak ditemukan
          </p>
          <Link
            href="/kantin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Merchant
          </Link>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalTransactions: transactions.length,
    totalRevenue: transactions
      .filter((t) => t.status === "APPROVED")
      .reduce((sum, t) => {
        const amount = Number(t.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0),
    pendingTransactions: transactions.filter((t) => t.status === "PENDING")
      .length,
    successfulTransactions: transactions.filter((t) => t.status === "APPROVED")
      .length,
  };

  return (
    <div className="space-y-6 p-6">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/kantin"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="w-7 h-7 text-blue-600" />
              {merchant.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Detail merchant dan riwayat transaksi
            </p>
          </div>
        </div>

        <button
          onClick={loadMerchantData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Saldo Merchant
              </p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatCurrency(merchant.balance)}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Transaksi
              </p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                {stats.totalTransactions}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Pendapatan
              </p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Transaksi Sukses
              </p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {stats.successfulTransactions}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Informasi Merchant
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Merchant
                </label>
                <p className="text-gray-900 font-medium text-lg">
                  {merchant.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <p className="text-gray-900 font-medium">{merchant.userId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Dibuat
                  </label>
                  <p className="text-gray-900">
                    {formatDate(merchant.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terakhir Diupdate
                  </label>
                  <p className="text-gray-900">
                    {formatDate(merchant.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Statistik Transaksi
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Transaksi:</span>
                <span className="font-semibold">{stats.totalTransactions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaksi Sukses:</span>
                <span className="font-semibold text-green-600">
                  {stats.successfulTransactions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaksi Pending:</span>
                <span className="font-semibold text-yellow-600">
                  {stats.pendingTransactions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Pendapatan:</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Riwayat Transaksi
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {transactions.length} transaksi ditemukan
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {transaction.santri?.name ||
                            `Santri #${transaction.santriId}`}
                        </h3>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {formatDate(transaction.createdAt)}
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-gray-500">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {getPaymentMethodBadge(transaction.paymentMethod)}
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {transaction.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada transaksi</p>
              <p className="text-gray-400 mt-2">
                Transaksi yang dilakukan akan muncul di sini
              </p>
              <Link
                href="/kantin/transaksi/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium mt-4"
              >
                <CreditCard className="w-4 h-4" />
                Buat Transaksi Pertama
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
