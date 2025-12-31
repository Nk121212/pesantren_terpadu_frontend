"use client";

import { useState, useEffect } from "react";
import { auditApi, type AuditTrail } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AuditTrailPage() {
  const router = useRouter();
  const [auditLogs, setAuditLogs] = useState<AuditTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [expandedLogs, setExpandedLogs] = useState<number[]>([]);

  // Get unique modules for filter
  const modules = ["all", ...new Set(auditLogs.map((log) => log.module))];

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await auditApi.list();
      console.log("AUDIT API RESPONSE:", response);

      let logs: AuditTrail[] = [];

      if (Array.isArray(response)) {
        logs = response;
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response
      ) {
        logs = Array.isArray(response.data) ? response.data : [];
      }

      console.log("FINAL LOGS:", logs);
      setAuditLogs(logs);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedLogs((prev) =>
      prev.includes(id) ? prev.filter((logId) => logId !== id) : [...prev, id]
    );
  };

  const formatDateTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const formatRelativeTime = (dateString: string | Date) => {
    const date = new Date(dateString);
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

  // Filter logs based on search and module
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Audit Trail
            </h1>
            <p className="text-gray-600 mt-1">Riwayat aktivitas sistem</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAuditLogs}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Aktivitas
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan modul, aksi, atau user..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Modul
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none"
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
              >
                <option value="all">Semua Modul</option>
                {modules
                  .filter((m) => m !== "all")
                  .map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">
              Total Aktivitas
            </p>
            <p className="text-2xl font-bold text-purple-800">
              {filteredLogs.length}
            </p>
            <p className="text-sm text-purple-600">log ditemukan</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada data audit trail</p>
            <p className="text-sm text-gray-400 mt-1">
              Belum ada aktivitas yang tercatat
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {formatDateTime(log.createdAt)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.module === "AUTH"
                            ? "bg-blue-100 text-blue-800"
                            : log.module === "SANTRI"
                            ? "bg-green-100 text-green-800"
                            : log.module === "PAYMENT"
                            ? "bg-yellow-100 text-yellow-800"
                            : log.module === "FINANCE"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.action.includes("CREATE")
                            ? "bg-green-100 text-green-800"
                            : log.action.includes("UPDATE")
                            ? "bg-blue-100 text-blue-800"
                            : log.action.includes("DELETE")
                            ? "bg-red-100 text-red-800"
                            : log.action.includes("LOGIN")
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {log.user?.name || "System"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.user?.role || "System"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">
                          {log.note || "Tidak ada catatan"}
                        </p>
                        {log.recordId && (
                          <p className="text-xs text-gray-500">
                            ID: {log.recordId}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                      >
                        {expandedLogs.includes(log.id) ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Sembunyikan
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Detail
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {expandedLogs.map((logId) => {
          const log = auditLogs.find((l) => l.id === logId);
          if (!log) return null;

          return (
            <div
              key={`detail-${logId}`}
              className="border-t border-gray-200 bg-gray-50 p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Detail Aktivitas
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Modul:</span>
                      <span className="text-sm font-medium">{log.module}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Aksi:</span>
                      <span className="text-sm font-medium">{log.action}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Waktu:</span>
                      <span className="text-sm font-medium">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                    {log.recordId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Record ID:
                        </span>
                        <span className="text-sm font-medium">
                          {log.recordId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    User Information
                  </h3>
                  {log.user ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Nama:</span>
                        <span className="text-sm font-medium">
                          {log.user.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Email:</span>
                        <span className="text-sm font-medium">
                          {log.user.email}
                        </span>
                      </div>
                      {log.user.role && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Role:</span>
                          <span className="text-sm font-medium">
                            {log.user.role}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aktivitas sistem</p>
                  )}
                </div>

                {log.note && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {log.note}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredLogs.length > 0 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-700">
            Menampilkan{" "}
            <span className="font-medium">1-{filteredLogs.length}</span> dari{" "}
            <span className="font-medium">{filteredLogs.length}</span> log
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
              Sebelumnya
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
