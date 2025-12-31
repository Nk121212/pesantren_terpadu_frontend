"use client";

import { useEffect, useState } from "react";
import { financeApi, type FinanceTransaction } from "@/lib/finance-api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function FinancePage() {
  const { user } = useAuth();
  const [data, setData] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await financeApi.list({ take: 50 });
      if (result.success) {
        setData(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId: number) => {
    if (!user?.id) {
      alert("User ID tidak ditemukan");
      return;
    }

    try {
      setActionLoading(transactionId);
      const result = await financeApi.approve(transactionId, user.id);

      if (result.success) {
        // Update data lokal
        setData((prev) =>
          prev.map((t) => (t.id === transactionId ? result.data! : t))
        );
        alert("Transaksi berhasil disetujui");
      } else {
        alert(result.error || "Gagal menyetujui transaksi");
      }
    } catch (error) {
      console.error("Approve error:", error);
      alert("Terjadi kesalahan saat menyetujui transaksi");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (transactionId: number) => {
    if (!user?.id) {
      alert("User ID tidak ditemukan");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menolak transaksi ini?")) {
      return;
    }

    try {
      setActionLoading(transactionId);
      const result = await financeApi.reject(transactionId, user.id);

      if (result.success) {
        // Update data lokal
        setData((prev) =>
          prev.map((t) => (t.id === transactionId ? result.data! : t))
        );
        alert("Transaksi berhasil ditolak");
      } else {
        alert(result.error || "Gagal menolak transaksi");
      }
    } catch (error) {
      console.error("Reject error:", error);
      alert("Terjadi kesalahan saat menolak transaksi");
    } finally {
      setActionLoading(null);
    }
  };

  const canApproveReject =
    user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const filteredTransactions = data.filter((transaction) => {
    const matchesSearch =
      transaction.category.toLowerCase().includes(search.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "ALL" || transaction.type === typeFilter;

    const matchesStatus =
      statusFilter === "ALL" || transaction.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      APPROVED: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Disetujui",
      },
      REJECTED: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Ditolak",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
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

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      INCOME: {
        color: "bg-green-100 text-green-800",
        icon: TrendingUp,
        label: "Pendapatan",
      },
      EXPENSE: {
        color: "bg-red-100 text-red-800",
        icon: TrendingDown,
        label: "Pengeluaran",
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig];
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Statistics
  const stats = {
    total: data.length,
    income: data.filter((t) => t.type === "INCOME").length,
    expense: data.filter((t) => t.type === "EXPENSE").length,
    pending: data.filter((t) => t.status === "PENDING").length,
    approved: data.filter((t) => t.status === "APPROVED").length,
    rejected: data.filter((t) => t.status === "REJECTED").length,
    totalIncome: data
      .filter((t) => t.type === "INCOME" && t.status === "APPROVED")
      .reduce((sum, t) => sum + Number(t.amount), 0),
    totalExpense: data
      .filter((t) => t.type === "EXPENSE" && t.status === "APPROVED")
      .reduce((sum, t) => sum + Number(t.amount), 0),
  };

  stats.totalIncome = stats.totalIncome || 0;
  stats.totalExpense = stats.totalExpense || 0;

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
            <DollarSign className="w-7 h-7 text-blue-600" />
            Daftar Transaksi Keuangan
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola transaksi keuangan pesantren
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
            href="/finance/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Transaksi
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
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
              <p className="text-sm font-medium text-gray-600">
                Total Pendapatan
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(stats.totalIncome)}
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
                Total Pengeluaran
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari kategori atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="INCOME">Pendapatan</option>
            <option value="EXPENSE">Pengeluaran</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("ALL");
              setStatusFilter("ALL");
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal
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
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.category}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">
                      {transaction.description || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(transaction.type)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/finance/${transaction.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {canApproveReject && transaction.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(transaction.id)}
                            disabled={actionLoading === transaction.id}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Setujui Transaksi"
                          >
                            {actionLoading === transaction.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Setujui
                          </button>

                          <button
                            onClick={() => handleReject(transaction.id)}
                            disabled={actionLoading === transaction.id}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Tolak Transaksi"
                          >
                            {actionLoading === transaction.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Tolak
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {data.length === 0
                ? "Tidak ada data transaksi"
                : "Tidak ditemukan transaksi yang sesuai filter"}
            </p>
            {search && (
              <p className="text-gray-400 mt-2">
                Tidak ditemukan transaksi dengan kata kunci {search}
              </p>
            )}
            {data.length === 0 && (
              <Link
                href="/finance/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mt-4"
              >
                <Plus className="w-4 h-4" />
                Tambah Transaksi Pertama
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
