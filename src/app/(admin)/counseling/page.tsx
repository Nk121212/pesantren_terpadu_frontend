"use client";

import { useState, useEffect, useCallback } from "react";
import { counselingApi, CounselingSession, CounselingStatus } from "@/lib/api";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Clock3,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Activity,
  ChevronRight,
} from "lucide-react";

interface CounselingStats {
  totalSessions: number;
  totalPlanned: number;
  totalOngoing: number;
  totalCompleted: number;
  totalCancelled: number;
}

const getStatusColor = (status: CounselingStatus) => {
  switch (status) {
    case CounselingStatus.PLANNED:
      return "bg-blue-100 text-blue-800";
    case CounselingStatus.ONGOING:
      return "bg-yellow-100 text-yellow-800";
    case CounselingStatus.COMPLETED:
      return "bg-green-100 text-green-800";
    case CounselingStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: CounselingStatus) => {
  switch (status) {
    case CounselingStatus.PLANNED:
      return Calendar;
    case CounselingStatus.ONGOING:
      return Clock3;
    case CounselingStatus.COMPLETED:
      return CheckCircle;
    case CounselingStatus.CANCELLED:
      return XCircle;
    default:
      return Clock;
  }
};

// Helper function untuk format date
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays === 1) return "Kemarin";
  return `${diffDays} hari yang lalu`;
};

export default function CounselingDashboardPage() {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [stats, setStats] = useState<CounselingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchAllData = useCallback(async () => {
    try {
      setRefreshing(true);

      const [sessionsRes, statsRes] = await Promise.all([
        counselingApi.list({ take: 20 }),
        counselingApi.getStats(),
      ]);

      let sessionsList: CounselingSession[] = [];
      let statsData: CounselingStats;

      // Process sessions response
      if (
        sessionsRes.success &&
        sessionsRes.data &&
        Array.isArray(sessionsRes.data)
      ) {
        sessionsList = sessionsRes.data;
      } else if (Array.isArray(sessionsRes)) {
        sessionsList = sessionsRes;
      }
      setSessions(sessionsList);

      // Process stats response
      if (statsRes.success && statsRes.data) {
        statsData = statsRes.data;
      } else {
        // Calculate fallback stats
        const planned = sessionsList.filter(
          (s) => s.status === CounselingStatus.PLANNED
        ).length;
        const ongoing = sessionsList.filter(
          (s) => s.status === CounselingStatus.ONGOING
        ).length;
        const completed = sessionsList.filter(
          (s) => s.status === CounselingStatus.COMPLETED
        ).length;
        const cancelled = sessionsList.filter(
          (s) => s.status === CounselingStatus.CANCELLED
        ).length;

        statsData = {
          totalSessions: sessionsList.length,
          totalPlanned: planned,
          totalOngoing: ongoing,
          totalCompleted: completed,
          totalCancelled: cancelled,
        };
      }
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch counseling data:", error);
      // Fallback data
      setStats({
        totalSessions: 0,
        totalPlanned: 0,
        totalOngoing: 0,
        totalCompleted: 0,
        totalCancelled: 0,
      });
      setSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleRefresh = () => {
    fetchAllData();
  };

  const handleStatusUpdate = async (
    id: number,
    newStatus: CounselingStatus
  ) => {
    try {
      const result = await counselingApi.updateStatus(id, {
        status: newStatus,
      });
      if (result.success) {
        fetchAllData(); // Refresh data
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.santri?.name &&
        session.santri.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.counselor?.name &&
        session.counselor.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const displayStats = stats || {
    totalSessions: 0,
    totalPlanned: 0,
    totalOngoing: 0,
    totalCompleted: 0,
    totalCancelled: 0,
  };

  // Get recent activities
  const recentActivities = sessions
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3)
    .map((session) => ({
      id: session.id,
      title: "Sesi konseling",
      description: session.topic,
      timestamp: getRelativeTime(new Date(session.createdAt)),
      status: session.status,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            Dashboard Konseling
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola sesi konseling dan pengasuhan santri
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
            href="/counseling/create"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Buat Sesi
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link href="/counseling">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sesi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {displayStats.totalSessions}
                </p>
                <p className="text-xs text-gray-500 mt-1">Semua sesi</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/counseling?status=PLANNED">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Direncanakan
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {displayStats.totalPlanned}
                </p>
                <p className="text-xs text-gray-500 mt-1">Status: PLANNED</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/counseling?status=ONGOING">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Berlangsung</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {displayStats.totalOngoing}
                </p>
                <p className="text-xs text-gray-500 mt-1">Status: ONGOING</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock3 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/counseling?status=COMPLETED">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {displayStats.totalCompleted}
                </p>
                <p className="text-xs text-gray-500 mt-1">Status: COMPLETED</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/counseling?status=CANCELLED">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dibatalkan</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {displayStats.totalCancelled}
                </p>
                <p className="text-xs text-gray-500 mt-1">Status: CANCELLED</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="Cari berdasarkan topik atau nama santri/konselor..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value={CounselingStatus.PLANNED}>Direncanakan</option>
                <option value={CounselingStatus.ONGOING}>Berlangsung</option>
                <option value={CounselingStatus.COMPLETED}>Selesai</option>
                <option value={CounselingStatus.CANCELLED}>Dibatalkan</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Aktivitas Terbaru
          </h2>
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Memperbarui...
            </div>
          )}
        </div>
        <div className="p-6">
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const StatusIcon = getStatusIcon(
                  activity.status as CounselingStatus
                );
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-full ${getStatusColor(
                        activity.status as CounselingStatus
                      )}`}
                    >
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {activity.timestamp}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada aktivitas</p>
              <p className="text-sm text-gray-400 mt-1">
                Mulai dengan membuat sesi konseling baru
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      {filteredSessions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Sesi Konseling Terbaru ({filteredSessions.length})
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSessions.slice(0, 6).map((session) => {
                const StatusIcon = getStatusIcon(session.status);
                return (
                  <Link
                    key={session.id}
                    href={`/counseling/${session.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">
                      {session.topic}
                    </h3>
                    {session.notes && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {session.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(
                          session.status
                        )}`}
                      >
                        <StatusIcon className="inline w-3 h-3 mr-1" />
                        {session.status}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Santri:{" "}
                          {session.santri?.name || `ID: ${session.santriId}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">
                          Konselor:{" "}
                          {session.counselor?.name || "Belum ditentukan"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500">
                        {session.scheduledAt
                          ? new Date(session.scheduledAt).toLocaleDateString(
                              "id-ID"
                            )
                          : "Belum dijadwalkan"}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        Detail →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {filteredSessions.length > 6 && (
              <div className="text-center mt-6">
                <Link
                  href="/counseling"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  Lihat semua sesi konseling ({filteredSessions.length})
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Statistik Konseling
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {displayStats.totalPlanned}
              </div>
              <div className="text-sm text-gray-500 mt-1">Direncanakan</div>
              <div className="text-xs text-gray-400 mt-1">
                {displayStats.totalSessions > 0
                  ? `${Math.round(
                      (displayStats.totalPlanned / displayStats.totalSessions) *
                        100
                    )}%`
                  : "0%"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {displayStats.totalOngoing}
              </div>
              <div className="text-sm text-gray-500 mt-1">Berlangsung</div>
              <div className="text-xs text-gray-400 mt-1">
                {displayStats.totalSessions > 0
                  ? `${Math.round(
                      (displayStats.totalOngoing / displayStats.totalSessions) *
                        100
                    )}%`
                  : "0%"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {displayStats.totalCompleted}
              </div>
              <div className="text-sm text-gray-500 mt-1">Selesai</div>
              <div className="text-xs text-gray-400 mt-1">
                {displayStats.totalSessions > 0
                  ? `${Math.round(
                      (displayStats.totalCompleted /
                        displayStats.totalSessions) *
                        100
                    )}%`
                  : "0%"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {displayStats.totalCancelled}
              </div>
              <div className="text-sm text-gray-500 mt-1">Dibatalkan</div>
              <div className="text-xs text-gray-400 mt-1">
                {displayStats.totalSessions > 0
                  ? `${Math.round(
                      (displayStats.totalCancelled /
                        displayStats.totalSessions) *
                        100
                    )}%`
                  : "0%"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* No Sessions Message */}
      {filteredSessions.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada sesi konseling</p>
            <p className="text-sm text-gray-400 mt-1">
              Mulai dengan membuat sesi konseling baru
            </p>
            <Link href="/counseling/create" className="mt-4 inline-block">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
                <Plus className="w-4 h-4" />
                Buat Sesi Baru
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
