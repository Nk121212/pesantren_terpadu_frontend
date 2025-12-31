"use client";

import { useEffect, useState } from "react";
import {
  tabunganApi,
  type Savings,
  type SavingsTransaction,
  parseBalance,
} from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PiggyBank,
  User,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Plus,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function SavingsDetailPage() {
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

      // Fetch savings detail
      const savingsRes = await tabunganApi.getById(savingsId);

      if (savingsRes.success) {
        setSavings(savingsRes.data ?? null);

        // Fetch transactions
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
      } else {
        console.error("❌ Failed to fetch savings:", savingsRes.error);
        setError(savingsRes.error || "Gagal memuat data rekening");
        setSavings(null);
      }
    } catch (error: unknown) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Tanggal tidak valid"
        : date.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
    } catch {
      return "Tanggal tidak valid";
    }
  };

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data rekening...</p>
        </div>
      </div>
    );
  }

  if (error || !savings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
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

  const approvedTransactions = transactions.filter(
    (t) => t.status === "APPROVED"
  );
  const totalIncome = approvedTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = approvedTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalIncome - totalExpense;

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
            Detail Rekening Tabungan
          </h1>
          <p className="text-gray-600 mt-1">{getSantriName()}</p>
        </div>
        <div className="flex gap-3">
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
          <Link
            href={`/tabungan/${savingsId}/transaksi/create`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Transaksi Baru
          </Link>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Rekening
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Pemilik Rekening</p>
                  <p className="font-medium text-gray-900">{getSantriName()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PiggyBank className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">ID Rekening</p>
                  <p className="font-medium text-gray-900">#{savings.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">ID Santri</p>
                  <p className="font-medium text-gray-900">
                    {savings.santriId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Dibuat Pada</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(savings.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Saldo dari Backend</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(parseBalance(savings.balance))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Saldo Dihitung</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(currentBalance)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Transaksi Terbaru ({transactions.length})
              </h2>
              <Link
                href={`/tabungan/${savingsId}/transaksi`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "INCOME"
                          ? "bg-green-100 text-green-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {transaction.type === "INCOME" ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.type === "INCOME"
                          ? "Setoran"
                          : "Penarikan"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p
                      className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.status.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada transaksi</p>
                  <Link
                    href={`/tabungan/${savingsId}/transaksi/create`}
                    className="inline-block mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Buat Transaksi Pertama
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ringkasan Saldo
            </h2>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Saldo Saat Ini</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(currentBalance)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  (Dihitung dari transaksi approved)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <ArrowUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Total Setoran</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="text-center">
                  <ArrowDown className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Total Penarikan</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Aksi Cepat
            </h2>
            <div className="space-y-3">
              <Link
                href={`/tabungan/${savingsId}/transaksi/create?type=INCOME`}
                className="w-full flex items-center gap-3 p-3 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition"
              >
                <ArrowUp className="w-5 h-5" />
                <span className="font-medium">Setor Uang</span>
              </Link>
              <Link
                href={`/tabungan/${savingsId}/transaksi/create?type=EXPENSE`}
                className="w-full flex items-center gap-3 p-3 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition"
              >
                <ArrowDown className="w-5 h-5" />
                <span className="font-medium">Tarik Uang</span>
              </Link>
              <Link
                href={`/tabungan/${savingsId}/transaksi`}
                className="w-full flex items-center gap-3 p-3 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition"
              >
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Lihat Semua Transaksi</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
