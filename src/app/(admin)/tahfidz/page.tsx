"use client";

import { useState, useEffect, useCallback } from "react";
import { tahfidzApi, TahfidzRecord, TahfidzOverviewStats } from "@/lib/api";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Clock,
  User,
  ChevronRight,
  BarChart3,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  Users,
  Layers,
  TrendingDown,
  Edit,
  Trash2, // ✅ Tambahkan icon delete
  X, // ✅ Tambahkan icon X untuk modal
} from "lucide-react";

/* ===========================
   ✅ TYPES TAMBAHAN (NO ANY)
=========================== */

interface PaginationMeta {
  total: number;
  limit: number;
  totalPages?: number;
}

interface TahfidzApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: PaginationMeta;
  error?: string;
}

interface NestedTahfidzResponse<T> {
  success: boolean;
  data?: {
    success?: boolean;
    data?: T;
    meta?: PaginationMeta;
  };
}

/* ===========================
   ✅ UTILS (NGGAK DIUBAH)
=========================== */

const getJuzColor = (juz?: number) => {
  if (!juz) return "bg-gray-100 text-gray-800";

  const colors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-yellow-100 text-yellow-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
    "bg-red-100 text-red-800",
    "bg-teal-100 text-teal-800",
    "bg-orange-100 text-orange-800",
    "bg-cyan-100 text-cyan-800",
  ];
  return colors[(juz - 1) % colors.length];
};

const getScoreColor = (score?: number) => {
  if (score === undefined || score === null) return "bg-gray-100 text-gray-800";
  if (score >= 90) return "bg-green-100 text-green-800";
  if (score >= 80) return "bg-blue-100 text-blue-800";
  if (score >= 70) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

// Helper function untuk format date
const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function TahfidzDashboardPage() {
  const [records, setRecords] = useState<TahfidzRecord[]>([]);
  const [stats, setStats] = useState<TahfidzOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [juzFilter, setJuzFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    limit: 10,
  });

  // ✅ Tambahkan state untuk modal delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<TahfidzRecord | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ✅ State untuk toast notification
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // ✅ Fungsi untuk show toast
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // ✅ Fungsi untuk menangani klik tombol delete
  const handleDeleteClick = (record: TahfidzRecord) => {
    setRecordToDelete(record);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  // ✅ Fungsi untuk konfirmasi delete
  // ✅ Fungsi untuk konfirmasi delete
  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    try {
      setDeleting(true);
      setDeleteError(null);

      const response = await tahfidzApi.delete(recordToDelete.id);

      if (response.success) {
        // Update records state dengan menghapus record yang dihapus
        setRecords((prev) =>
          prev.filter((record) => record.id !== recordToDelete.id)
        );

        // ✅ REFETCH STATS SETELAH DELETE
        try {
          const statsRes = await tahfidzApi.getOverviewStats();

          if (statsRes?.success) {
            let statsData: TahfidzOverviewStats | null = null;

            if (
              (statsRes as NestedTahfidzResponse<TahfidzOverviewStats>)?.data
                ?.success &&
              (statsRes as NestedTahfidzResponse<TahfidzOverviewStats>)?.data
                ?.data
            ) {
              statsData = (
                statsRes as NestedTahfidzResponse<TahfidzOverviewStats>
              ).data!.data!;
            } else if (
              (statsRes as TahfidzApiResponse<TahfidzOverviewStats>)?.data
            ) {
              statsData = (statsRes as TahfidzApiResponse<TahfidzOverviewStats>)
                .data!;
            }

            const safeStats: TahfidzOverviewStats = {
              totalRecords: statsData?.totalRecords ?? 0,
              totalSantri: statsData?.totalSantri ?? 0,
              averageScore: statsData?.averageScore ?? 0,
              totalPagesMemorized: statsData?.totalPagesMemorized ?? 0,
              juzDistribution: statsData?.juzDistribution ?? [],
              recentActivity: statsData?.recentActivity ?? 0,
            };

            setStats(safeStats);
          }
        } catch (statsError) {
          console.error("Failed to refetch stats after delete:", statsError);
          // Fallback: update stats manually
          if (stats && recordToDelete.juz) {
            const updatedJuzDistribution = stats.juzDistribution
              .map((juzStat) => {
                if (juzStat.juz === recordToDelete.juz && juzStat.count > 0) {
                  return {
                    ...juzStat,
                    count: juzStat.count - 1,
                  };
                }
                return juzStat;
              })
              .filter((juzStat) => juzStat.count > 0); // Remove juz with 0 count

            setStats((prev) =>
              prev
                ? {
                    ...prev,
                    totalRecords: prev.totalRecords - 1,
                    totalPagesMemorized:
                      prev.totalPagesMemorized -
                      (recordToDelete.pageEnd - recordToDelete.pageStart + 1),
                    juzDistribution: updatedJuzDistribution,
                  }
                : null
            );
          }
        }

        // Update pagination meta
        setPaginationMeta((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));

        // Close modal
        setDeleteModalOpen(false);
        setRecordToDelete(null);

        // Show success toast
        showToast("Catatan hafalan berhasil dihapus", "success");
      } else {
        setDeleteError(response.error || "Gagal menghapus catatan hafalan");
        showToast(response.error || "Gagal menghapus catatan hafalan", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError("Terjadi kesalahan saat menghapus data");
      showToast("Terjadi kesalahan saat menghapus data", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Fungsi untuk membatalkan delete
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setRecordToDelete(null);
    setDeleteError(null);
  };

  const fetchAllData = useCallback(async () => {
    try {
      setRefreshing(true);

      const [statsRes, listRes] = await Promise.all<
        [
          ReturnType<typeof tahfidzApi.getOverviewStats>,
          ReturnType<typeof tahfidzApi.getAll>
        ]
      >([
        tahfidzApi.getOverviewStats(),
        tahfidzApi.getAll({ skip: (currentPage - 1) * 10, take: 10 }),
      ]);

      // =========================
      // ✅ PROCESS STATS
      // =========================

      let statsData: TahfidzOverviewStats | null = null;

      if (statsRes?.success) {
        if (
          (statsRes as NestedTahfidzResponse<TahfidzOverviewStats>)?.data
            ?.success &&
          (statsRes as NestedTahfidzResponse<TahfidzOverviewStats>)?.data?.data
        ) {
          statsData = (statsRes as NestedTahfidzResponse<TahfidzOverviewStats>)
            .data!.data!;
        } else if (
          (statsRes as TahfidzApiResponse<TahfidzOverviewStats>)?.data
        ) {
          statsData = (statsRes as TahfidzApiResponse<TahfidzOverviewStats>)
            .data!;
        }
      }

      const safeStats: TahfidzOverviewStats = {
        totalRecords: statsData?.totalRecords ?? 0,
        totalSantri: statsData?.totalSantri ?? 0,
        averageScore: statsData?.averageScore ?? 0,
        totalPagesMemorized: statsData?.totalPagesMemorized ?? 0,
        juzDistribution: statsData?.juzDistribution ?? [],
        recentActivity: statsData?.recentActivity ?? 0,
      };

      setStats(safeStats);

      // =========================
      // ✅ PROCESS RECORDS
      // =========================

      let recordsData: TahfidzRecord[] = [];
      let totalRecords = 0;
      let limit = 10;
      let totalPages = 1;

      // Gunakan listRes, bukan recordsRes
      if (listRes?.success) {
        // <-- INI YANG DIPERBAIKI
        const nested = listRes as NestedTahfidzResponse<{
          data: TahfidzRecord[];
          meta?: PaginationMeta;
        }>;

        const normal = listRes as TahfidzApiResponse<TahfidzRecord[]>;

        // Debug log untuk melihat struktur response
        console.log("API Response structure:", listRes);
        console.log("Is nested.data?.success?", nested?.data?.success);
        console.log("Is nested.data?.data?.data?", nested?.data?.data?.data);
        console.log("Is normal.data?", normal?.data);

        // Struktur yang mungkin:
        // 1. { success: true, data: { data: [...], meta: {...} } }
        // 2. { success: true, data: { success: true, data: { data: [...], meta: {...} } } }
        // 3. { success: true, data: [...] }

        if (
          nested?.data?.success &&
          nested?.data?.data &&
          Array.isArray(nested.data.data.data)
        ) {
          // Struktur 2: sangat nested
          console.log("Using structure 2 (deeply nested)");
          recordsData = nested.data.data.data;
          totalRecords = nested.data.data.meta?.total ?? 0;
          limit = nested.data.data.meta?.limit ?? 10;
          totalPages = nested.data.data.meta?.totalPages ?? 1;
        } else if (nested?.data?.data && Array.isArray(nested.data.data)) {
          // Struktur 1: nested biasa
          console.log("Using structure 1 (nested)");
          recordsData = nested.data.data;
          totalRecords = nested.data.meta?.total ?? 0;
          limit = nested.data.meta?.limit ?? 10;
          totalPages = nested.data.meta?.totalPages ?? 1;
        } else if (normal?.data && Array.isArray(normal.data)) {
          // Struktur 3: flat
          console.log("Using structure 3 (flat)");
          recordsData = normal.data;
          totalRecords = normal.meta?.total ?? normal.data.length;
          limit = normal.meta?.limit ?? 10;
          totalPages = normal.meta?.totalPages ?? 1;
        } else {
          console.warn("Unexpected API structure:", listRes);
        }
      } else {
        console.warn("API call was not successful:", listRes);
      }

      console.log("Processed data:", {
        recordsDataLength: recordsData.length,
        totalRecords,
        limit,
        totalPages,
      });

      setRecords(recordsData);
      setPaginationMeta({ total: totalRecords, limit });
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Failed to fetch tahfidz data:", error);

      // Fallback data
      setStats({
        totalRecords: 0,
        totalSantri: 0,
        averageScore: 0,
        totalPagesMemorized: 0,
        juzDistribution: [],
        recentActivity: 0,
      });

      setRecords([]);
      setPaginationMeta({ total: 0, limit: 10 });
      setTotalPages(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleRefresh = () => {
    fetchAllData();
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filteredRecords = Array.isArray(records)
    ? records.filter((record) => {
        const santriName = record?.santri?.name || "";
        const remarks = record?.remarks || "";
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch =
          santriName.toLowerCase().includes(searchLower) ||
          remarks.toLowerCase().includes(searchLower);

        const matchesJuz =
          juzFilter === "all" || (record?.juz?.toString() || "") === juzFilter;

        return matchesSearch && matchesJuz;
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const displayStats: TahfidzOverviewStats = stats || {
    totalRecords: 0,
    totalSantri: 0,
    averageScore: 0,
    totalPagesMemorized: 0,
    juzDistribution: [],
    recentActivity: 0,
  };

  const juzOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  const juzDistribution = displayStats.juzDistribution || [];
  const totalJuzCompleted = Array.isArray(juzDistribution)
    ? juzDistribution.filter((juz) => (juz?.count ?? 0) > 0).length
    : 0;

  const formatNumber = (num?: number) => {
    return (num ?? 0).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-green-600" />
            Dashboard Hafalan Al-Qur`an
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola pencatatan hafalan dan kemajuan santri
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
          <Link
            href="/tahfidz/create"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Catat Hafalan
          </Link>
        </div>
      </div>

      {/* Stats Grid - FIXED: Use safe formatting */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Catatan</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(displayStats.totalRecords)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(displayStats.recentActivity)} dalam 7 hari
                terakhir
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Santri Aktif</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(displayStats.totalSantri)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Sedang menghafal</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Rata-rata Nilai
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {displayStats.averageScore?.toFixed(1) || "0.0"}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {(displayStats.averageScore || 0) >= 80 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-yellow-600" />
                )}
                <p className="text-xs text-gray-500">
                  {(displayStats.averageScore || 0) >= 80
                    ? "Baik"
                    : "Perlu ditingkatkan"}
                </p>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Halaman</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(displayStats.totalPagesMemorized)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {totalJuzCompleted} juz terselesaikan
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Layers className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Juz Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Distribusi Hafalan per Juz
          </h2>
          <span className="text-sm text-gray-500">
            Total {juzDistribution.length} juz aktif
          </span>
        </div>
        <div className="p-6">
          {juzDistribution.length > 0 ? (
            <div className="space-y-4">
              {juzDistribution.map((juzStat, index) => {
                if (!juzStat || typeof juzStat.juz === "undefined") return null;

                const juzCount = juzStat.count || 0;
                const juzNumber = juzStat.juz;

                // Calculate max count for width calculation
                const allCounts = juzDistribution
                  .map((j) => j?.count || 0)
                  .filter((count) => count > 0);
                const maxCount =
                  allCounts.length > 0 ? Math.max(...allCounts) : 1;

                return (
                  <div key={juzNumber} className="flex items-center gap-4">
                    <div className="w-16">
                      <div
                        className={`text-center font-bold p-2 rounded-lg ${getJuzColor(
                          juzNumber
                        )}`}
                      >
                        Juz {juzNumber}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {juzCount} catatan
                        </span>
                        <span className="text-gray-900 font-medium">
                          {displayStats.totalRecords > 0
                            ? (
                                (juzCount / displayStats.totalRecords) *
                                100
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(juzCount / maxCount) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada data hafalan</p>
              <p className="text-sm text-gray-400 mt-1">
                Mulai dengan mencatat hafalan santri
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="Cari berdasarkan nama santri..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={juzFilter}
                onChange={(e) => setJuzFilter(e.target.value)}
              >
                <option value="all">Semua Juz</option>
                {juzOptions.map((juz) => (
                  <option key={juz} value={juz.toString()}>
                    Juz {juz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Daftar Catatan Hafalan
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Menampilkan {filteredRecords.length} dari{" "}
              {formatNumber(paginationMeta.total)} catatan
            </p>
          </div>
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Memperbarui...
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {filteredRecords.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Santri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Juz & Halaman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nilai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.santri?.name || `ID: ${record.santriId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.santri?.gender || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getJuzColor(
                            record.juz
                          )}`}
                        >
                          Juz {record.juz || "-"}
                        </span>
                        <span className="text-sm text-gray-600">
                          Hlm. {record.pageStart} - {record.pageEnd}
                        </span>
                      </div>
                      {record.remarks && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {record.remarks}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {record.score !== undefined && record.score !== null ? (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                            record.score
                          )}`}
                        >
                          {record.score}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.createdAt ? formatDate(record.createdAt) : "-"}
                      </div>
                      {record.teacher && (
                        <div className="text-xs text-gray-500">
                          Oleh: {record.teacher.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tahfidz/${record.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm"
                        >
                          <Eye className="w-3 h-3" />
                          Lihat
                        </Link>
                        <Link
                          href={`/tahfidz/${record.id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition text-sm"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Link>
                        {/* ✅ Tombol Delete */}
                        <button
                          onClick={() => handleDeleteClick(record)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm disabled:opacity-50 cursor-pointer"
                          disabled={deleting}
                        >
                          <Trash2 className="w-3 h-3" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada catatan hafalan</p>
              <p className="text-sm text-gray-400 mt-1">
                {records.length > 0
                  ? `Ada ${records.length} catatan, tapi tidak cocok dengan filter`
                  : "Mulai dengan mencatat hafalan santri"}
              </p>
              {records.length === 0 && (
                <Link href="/tahfidz/create" className="mt-4 inline-block">
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                    <Plus className="w-4 h-4" />
                    Catat Hafalan Baru
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {paginationMeta.total > paginationMeta.limit && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan{" "}
                <span className="font-medium">
                  {(currentPage - 1) * paginationMeta.limit + 1}
                </span>{" "}
                -{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * paginationMeta.limit,
                    paginationMeta.total
                  )}
                </span>{" "}
                dari{" "}
                <span className="font-medium">
                  {formatNumber(paginationMeta.total)}
                </span>{" "}
                catatan
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === pageNum
                            ? "bg-green-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Konfirmasi Hapus
                </h3>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={deleting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Apakah Anda yakin ingin menghapus catatan hafalan ini?
                </p>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {recordToDelete.santri?.name ||
                          `ID: ${recordToDelete.santriId}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        Juz {recordToDelete.juz || "-"} • Hlm.{" "}
                        {recordToDelete.pageStart} - {recordToDelete.pageEnd}
                      </div>
                    </div>
                  </div>

                  {recordToDelete.score && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Nilai:</span>{" "}
                      {recordToDelete.score}
                    </div>
                  )}

                  {recordToDelete.remarks && (
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Catatan:</span>{" "}
                      {recordToDelete.remarks}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    Tanggal:{" "}
                    {recordToDelete.createdAt
                      ? formatDate(recordToDelete.createdAt)
                      : "-"}
                  </div>
                </div>

                {deleteError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{deleteError}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Ya, Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
