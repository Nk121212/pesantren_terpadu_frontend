"use client";

import { useEffect, useState } from "react";
import { tabunganApi, type Savings, type SavingsBalance } from "@/lib/api";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  PiggyBank,
  ArrowUp,
  ArrowDown,
  Users,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

export default function TabunganListPage() {
  const [savingsData, setSavingsData] = useState<Savings[]>([]);
  const [balancesData, setBalancesData] = useState<SavingsBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [savingsRes, balancesRes] = await Promise.all([
          tabunganApi.list(),
          tabunganApi.getAllBalances(),
        ]);

        if (savingsRes.success) setSavingsData(savingsRes.data || []);
        if (balancesRes.success) setBalancesData(balancesRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSavings = savingsData.filter(
    (saving) =>
      saving.santriName?.toLowerCase().includes(search.toLowerCase()) ||
      saving.santriId.toString().includes(search)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalBalance = () => {
    return balancesData.reduce((total, balance) => total + balance.balance, 0);
  };

  const getTotalIncome = () => {
    return balancesData.reduce(
      (total, balance) => total + balance.totalIncome,
      0
    );
  };

  const getTotalExpense = () => {
    return balancesData.reduce(
      (total, balance) => total + balance.totalExpense,
      0
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      inactive: { color: "bg-gray-100 text-gray-800", icon: XCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
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
            <PiggyBank className="w-7 h-7 text-blue-600" />
            Tabungan Santri
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola tabungan dan transaksi santri
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/tabungan/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Buat Rekening
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Saldo</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(getTotalBalance())}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <PiggyBank className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Setoran</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(getTotalIncome())}
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
                {formatCurrency(getTotalExpense())}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <ArrowDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Jumlah Rekening
              </p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {savingsData.length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Rekening Tabungan */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Rekening Tabungan Santri
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Santri
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID Rekening
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSavings.map((saving) => {
                const balance = balancesData.find(
                  (b) => b.santriId === saving.santriId
                );

                return (
                  <tr key={saving.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {saving.santriName || `Santri ${saving.santriId}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID Santri: {saving.santriId}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">#{saving.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className={`text-lg font-bold ${
                          (balance?.balance || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(balance?.balance || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Setor: {formatCurrency(balance?.totalIncome || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Tarik: {formatCurrency(balance?.totalExpense || 0)}
                      </p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge("active")}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(saving.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tabungan/${saving.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/tabungan/${saving.id}/transaksi`}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          Transaksi
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSavings.length === 0 && (
          <div className="text-center py-12">
            <PiggyBank className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Belum ada rekening tabungan</p>
            {search && (
              <p className="text-gray-400 mt-2">
                Tidak ditemukan rekening dengan kata kunci {search}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
