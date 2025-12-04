"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";
import {
  academicApi,
  Attendance,
  AttendanceStatus,
  santriApi,
  Santri, // Import Santri type
} from "@/lib/api";

export default function AttendanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [santri, setSantri] = useState<Santri | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const id = Number(params.id);

      // Fetch attendance data
      const attendanceRes = await academicApi.getAttendance(id);

      if (attendanceRes && typeof attendanceRes === "object") {
        let attendanceData: Attendance;

        if ("data" in attendanceRes && attendanceRes.data) {
          const potentialData = attendanceRes.data as Partial<Attendance>;
          if (
            potentialData.id !== undefined &&
            potentialData.santriId !== undefined &&
            potentialData.date !== undefined &&
            potentialData.status !== undefined
          ) {
            attendanceData = potentialData as Attendance;
          } else {
            console.error("Invalid attendance data format:", potentialData);
            return;
          }
        } else {
          const potentialData = attendanceRes as Partial<Attendance>;
          if (
            potentialData.id !== undefined &&
            potentialData.santriId !== undefined &&
            potentialData.date !== undefined &&
            potentialData.status !== undefined
          ) {
            attendanceData = potentialData as Attendance;
          } else {
            console.error("Invalid attendance data format:", potentialData);
            return;
          }
        }

        setAttendance(attendanceData);

        // Fetch santri details
        if (attendanceData.santriId) {
          try {
            const santriRes = await santriApi.get(attendanceData.santriId);
            if (santriRes && typeof santriRes === "object") {
              // Tambahkan type guard untuk santri response
              if ("data" in santriRes && santriRes.data) {
                const santriData = santriRes.data as Partial<Santri>;
                // Validasi minimal properti Santri
                if (
                  santriData.id !== undefined &&
                  santriData.name !== undefined
                ) {
                  setSantri(santriData as Santri);
                }
              } else {
                const santriData = santriRes as Partial<Santri>;
                if (
                  santriData.id !== undefined &&
                  santriData.name !== undefined
                ) {
                  setSantri(santriData as Santri);
                }
              }
            }
          } catch (santriError) {
            console.error("Failed to fetch santri:", santriError);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus data absensi ini?")) return;

    try {
      setDeleting(true);
      const id = Number(params.id);
      await academicApi.deleteAttendance(id);

      // Log audit trail
      try {
        await academicApi.logAction?.({
          module: "ATTENDANCE",
          action: "DELETE",
          recordId: id,
          note: `Menghapus absensi ID: ${id}`,
        });
      } catch (auditError) {
        console.error("Failed to log audit:", auditError);
      }

      router.push("/academic/attendance");
    } catch (error) {
      console.error("Failed to delete attendance:", error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusConfig = useCallback((status: string) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          label: "Hadir",
        };
      case AttendanceStatus.SICK:
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
          label: "Sakit",
        };
      case AttendanceStatus.PERMIT:
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Clock className="w-5 h-5 text-blue-600" />,
          label: "Izin",
        };
      case AttendanceStatus.ABSENT:
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          label: "Absen",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <Clock className="w-5 h-5 text-gray-600" />,
          label: status,
        };
    }
  }, []);

  const formatDate = useCallback((dateString: string | Date) => {
    if (!dateString) return "Tanggal tidak tersedia";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Tanggal tidak valid";
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Format tanggal tidak valid";
    }
  }, []);

  const formatDateTime = useCallback((dateString: string | Date) => {
    if (!dateString) return "Tanggal tidak tersedia";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Tanggal tidak valid";
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Format tanggal tidak valid";
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Data Tidak Ditemukan
        </h1>
        <p className="text-gray-600 mb-6">
          Data absensi yang Anda cari tidak ditemukan.
        </p>
        <Link
          href="/academic/attendance"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Absensi
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(attendance.status);
  const teacherName = attendance.teacher?.name || "Sistem";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/academic/attendance"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-7 h-7 text-green-600" />
              Detail Absensi
            </h1>
            <p className="text-gray-600 mt-1">
              Informasi lengkap data kehadiran
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50"
            aria-label="Hapus absensi"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Hapus
          </button>
          <Link
            href={`/academic/attendance/${attendance.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Absensi
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Santri
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {santri?.name ||
                          attendance.santri?.name ||
                          "Tidak diketahui"}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {attendance.santriId}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status Kehadiran
                  </label>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg border ${statusConfig.color}`}
                  >
                    {statusConfig.icon}
                    <span className="font-semibold">{statusConfig.label}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Tanggal
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {formatDate(attendance.date)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Keterangan
                </label>
                <div className="p-3 bg-gray-50 rounded-lg min-h-[60px]">
                  <p className="text-gray-900">
                    {attendance.remarks || "Tidak ada keterangan"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recording Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Pencatatan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Dicatat Oleh
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {teacherName}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Tanggal Pencatatan
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {attendance.createdAt
                      ? formatDateTime(attendance.createdAt)
                      : "Tanggal tidak tersedia"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Aksi Cepat
            </h2>
            <div className="space-y-3">
              <Link
                href={`/academic/attendance/${attendance.id}/edit`}
                className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
              >
                <Edit className="w-5 h-5" />
                <span className="font-medium">Edit Absensi</span>
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition w-full text-left disabled:opacity-50"
                aria-label="Hapus absensi"
              >
                {deleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                <span className="font-medium">Hapus Absensi</span>
              </button>
              <Link
                href="/academic/attendance/create"
                className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
              >
                <ClipboardCheck className="w-5 h-5" />
                <span className="font-medium">Tambah Absensi Baru</span>
              </Link>
              {attendance.santriId && (
                <Link
                  href={`/santri/${attendance.santriId}`}
                  className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Lihat Profil Santri</span>
                </Link>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi
            </h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Data absensi dapat diedit jika ada kesalahan input</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Hapus data hanya jika benar-benar diperlukan</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Pastikan data sudah sesuai sebelum disimpan</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
