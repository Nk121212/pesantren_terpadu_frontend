"use client";

import { useState, useEffect } from "react";
import {
  type Attendance,
  AttendanceStatus,
  academicApi,
  santriApi,
  Santri,
} from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Search,
  Filter,
  Calendar,
  User,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [santriMap, setSantriMap] = useState<Record<number, Santri>>({});

  const fetchAttendance = async () => {
    try {
      setRefreshing(true);

      // Build params object with proper types
      const params: {
        skip?: number;
        take?: number;
        search?: string;
        date?: string;
        status?: AttendanceStatus;
      } = {
        take: 100,
      };

      if (search) params.search = search;
      if (dateFilter) params.date = dateFilter;
      if (statusFilter !== "all") {
        // Type assertion karena statusFilter adalah string
        params.status = statusFilter as AttendanceStatus;
      }

      const attendanceRes = await academicApi.listAttendance(params);
      const attendanceResNew = attendanceRes?.data;

      let attendances: Attendance[] = [];
      if (attendanceResNew && typeof attendanceResNew === "object") {
        if (
          "data" in attendanceResNew &&
          Array.isArray(attendanceResNew.data)
        ) {
          attendances = attendanceResNew.data;
        } else if (Array.isArray(attendanceResNew)) {
          attendances = attendanceResNew;
        } else if (
          "success" in attendanceResNew &&
          attendanceResNew.success &&
          Array.isArray(attendanceResNew.data)
        ) {
          attendances = attendanceResNew.data;
        }
      }

      setAttendanceData(attendances);

      // Fetch santri details for mapping
      const santriIds = Array.from(new Set(attendances.map((a) => a.santriId)));
      if (santriIds.length > 0) {
        const newSantriMap: Record<number, Santri> = {};

        // Fetch each santri individually
        for (const santriId of santriIds) {
          try {
            const santriRes = await santriApi.get(santriId);
            if (santriRes && typeof santriRes === "object") {
              if ("data" in santriRes) {
                newSantriMap[santriId] = santriRes.data as Santri;
              } else if ("id" in santriRes) {
                newSantriMap[santriId] = santriRes as Santri;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch santri ${santriId}:`, error);
          }
        }

        setSantriMap(newSantriMap);
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchAttendance();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, dateFilter, statusFilter]);

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "bg-green-100 text-green-800";
      case AttendanceStatus.SICK:
        return "bg-yellow-100 text-yellow-800";
      case AttendanceStatus.PERMITTED:
        return "bg-blue-100 text-blue-800";
      case AttendanceStatus.ABSENT:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case AttendanceStatus.SICK:
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case AttendanceStatus.PERMITTED:
        return <Clock className="w-4 h-4 text-blue-600" />;
      case AttendanceStatus.ABSENT:
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  // Di handleDelete di Detail Page, tambahkan error handling yang lebih baik:

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus data absensi ini?")) return;

    try {
      setDeleting(true);
      const id = Number(params.id);
      await academicApi.deleteAttendance(id);

      // Log audit trail
      try {
        const auditResponse = await academicApi.logAction({
          module: "ATTENDANCE",
          action: "DELETE",
          recordId: id,
          note: `Menghapus absensi ID: ${id}`,
        });

        if (!auditResponse.success) {
          console.warn("Audit logging failed:", auditResponse.error);
        }
      } catch (auditError) {
        console.error("Failed to log audit:", auditError);
      }

      alert("Absensi berhasil dihapus");

      // Kembali ke halaman utama/list absensi
      router.push("/academic/attendance");
    } catch (error) {
      console.error("Failed to delete attendance:", error);

      if (error instanceof Error) {
        alert(`Gagal menghapus absensi: ${error.message}`);
      } else {
        alert("Gagal menghapus absensi. Silakan coba lagi.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const filteredAttendance = attendanceData.filter((attendance) => {
    const santri = santriMap[attendance.santriId];
    const santriName = santri?.name?.toLowerCase() || "";
    const remarks = attendance.remarks?.toLowerCase() || "";

    const matchesSearch =
      search === "" ||
      santriName.includes(search.toLowerCase()) ||
      remarks.includes(search.toLowerCase());

    const matchesDate =
      !dateFilter ||
      new Date(attendance.date).toISOString().split("T")[0] === dateFilter;

    const matchesStatus =
      statusFilter === "all" || attendance.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter((a) => a.status === AttendanceStatus.PRESENT)
      .length,
    absent: attendanceData.filter((a) => a.status === AttendanceStatus.ABSENT)
      .length,
    sick: attendanceData.filter((a) => a.status === AttendanceStatus.SICK)
      .length,
    permitted: attendanceData.filter(
      (a) => a.status === AttendanceStatus.PERMITTED
    ).length,
  };

  if (loading && attendanceData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  const formatDate = (dateString: string | Date): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString("id-ID");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-green-600" />
            Absensi Santri
          </h1>
          <p className="text-gray-600 mt-1">Kelola data kehadiran santri</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAttendance}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <Link
            href="/academic/attendance/create"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Absensi
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <ClipboardCheck className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hadir</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.present}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sakit</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.sick}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Izin</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.permitted}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.absent}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Santri
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama santri..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value={AttendanceStatus.PRESENT}>Hadir</option>
                <option value={AttendanceStatus.SICK}>Sakit</option>
                <option value={AttendanceStatus.PERMITTED}>Izin</option>
                <option value={AttendanceStatus.ABSENT}>Absen</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Santri
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dicatat
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAttendance.map((attendance) => {
                const santri = santriMap[attendance.santriId];
                return (
                  <tr
                    key={attendance.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {santri?.name || "Loading..."}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {attendance.santriId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDate(attendance.date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(attendance.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            attendance.status
                          )}`}
                        >
                          {attendance.status === AttendanceStatus.PERMITTED
                            ? "IZIN"
                            : attendance.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {attendance.remarks || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(attendance.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/academic/attendance/${attendance.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/academic/attendance/${attendance.id}/edit`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(attendance.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAttendance.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada data absensi</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || dateFilter || statusFilter !== "all"
                ? "Coba ubah filter pencarian"
                : "Mulai dengan menambahkan data absensi"}
            </p>
            <Link
              href="/academic/attendance/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium mt-4"
            >
              <Plus className="w-4 h-4" />
              Tambah Data Absensi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
