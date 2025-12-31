"use client";

import { useEffect, useState } from "react";
import { canteenApi, type Merchant, type CanteenTransaction } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  Store,
  Users,
  CreditCard,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default function KantinPage() {
  const { user } = useAuth();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<
    CanteenTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [merchantsRes, transactionsRes] = await Promise.all([
        canteenApi.listMerchants(),
        canteenApi.listTransactions(1), // Default to first merchant for demo
      ]);

      if (merchantsRes.success) {
        setMerchants(merchantsRes.data || []);
      }

      if (transactionsRes.success) {
        setRecentTransactions(transactionsRes.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Terjadi kesalahan saat memuat data kantin");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending",
      },
      APPROVED: {
        color: "bg-green-100 text-green-800",
        label: "Sukses",
      },
      REJECTED: {
        color: "bg-red-100 text-red-800",
        label: "Ditolak",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      QRIS: {
        color: "bg-purple-100 text-purple-800",
        label: "QRIS",
      },
      VA: {
        color: "bg-blue-100 text-blue-800",
        label: "Virtual Account",
      },
      EWALLET: {
        color: "bg-orange-100 text-orange-800",
        label: "E-Wallet",
      },
      BANK_TRANSFER: {
        color: "bg-green-100 text-green-800",
        label: "Bank Transfer",
      },
    };

    const config =
      methodConfig[method as keyof typeof methodConfig] || methodConfig.QRIS;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
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

  // Filter transactions
  const filteredTransactions = recentTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.santri?.name?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.merchant?.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    totalMerchants: merchants.length,
    totalTransactions: recentTransactions.length,
    totalRevenue: recentTransactions
      .filter((t) => t.status === "APPROVED")
      .reduce((sum, t) => sum + Number(t.amount), 0),
    pendingTransactions: recentTransactions.filter(
      (t) => t.status === "PENDING"
    ).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-7 h-7 text-blue-600" />
            Manajemen Kantin Cashless
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola merchant dan transaksi kantin
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/kantin/merchant/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Merchant
          </Link>
          <Link
            href="/kantin/transaksi/create"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <CreditCard className="w-4 h-4" />
            Transaksi Baru
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Merchant
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalMerchants}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Transaksi
              </p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.totalTransactions}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Review
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.pendingTransactions}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Loader2 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchants List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Daftar Merchant
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {merchants.length} merchant terdaftar
                </p>
              </div>
              <Link
                href="/kantin/merchant"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Lihat Semua
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {merchants.slice(0, 5).map((merchant) => (
                <div
                  key={merchant.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {merchant.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Saldo: {formatCurrency(merchant.balance)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/kantin/merchant/${merchant.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Detail Merchant"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              ))}

              {merchants.length === 0 && (
                <div className="text-center py-8">
                  <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Belum ada merchant terdaftar
                  </p>
                  <Link
                    href="/kantin/merchant/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mt-4"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Merchant Pertama
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Transaksi Terbaru
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {recentTransactions.length} transaksi terakhir
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Sukses</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {filteredTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {transaction.santri?.name ||
                          `Santri #${transaction.santriId}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transaction.merchant?.name} •{" "}
                        {formatDate(transaction.createdAt)}
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {getPaymentMethodBadge(transaction.paymentMethod)}
                      {getStatusBadge(transaction.status)}
                    </div>
                    <Link
                      href="#"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {recentTransactions.length === 0
                      ? "Belum ada transaksi"
                      : "Tidak ditemukan transaksi yang sesuai filter"}
                  </p>
                  {search && (
                    <p className="text-gray-400 mt-2">
                      Tidak ditemukan transaksi dengan kata kunci {search}
                    </p>
                  )}
                  {recentTransactions.length === 0 && (
                    <Link
                      href="/kantin/transaksi/create"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium mt-4"
                    >
                      <Plus className="w-4 h-4" />
                      Buat Transaksi Pertama
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/kantin/merchant/create"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Tambah Merchant</h4>
              <p className="text-sm text-gray-600">Daftarkan merchant baru</p>
            </div>
          </Link>

          <Link
            href="/kantin/transaksi/create"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Buat Transaksi</h4>
              <p className="text-sm text-gray-600">Transaksi kantin baru</p>
            </div>
          </Link>

          <Link
            href="/kantin/merchant"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Kelola Merchant</h4>
              <p className="text-sm text-gray-600">Lihat semua merchant</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
