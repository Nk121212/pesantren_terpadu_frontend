"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  counselingApi,
  CounselingStatus,
  type CounselingSession,
} from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Edit,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock3,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";

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

export default function CounselingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [session, setSession] = useState<CounselingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      setRefreshing(true);
      const result = await counselingApi.get(parseInt(id));
      if (result.success && result.data) {
        setSession(result.data);
      } else {
        console.error("Failed to fetch session:", result.error);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleStatusUpdate = async (newStatus: CounselingStatus) => {
    if (
      !confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)
    ) {
      return;
    }

    try {
      setUpdating(true);
      const result = await counselingApi.updateStatus(parseInt(id), {
        status: newStatus,
      });
      if (result.success && result.data) {
        setSession(result.data);
        fetchSession(); // Refresh data
      } else {
        alert(result.error || "Gagal mengupdate status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus sesi konseling ini? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      // TODO: Tambahkan API untuk delete session jika ada
      // const result = await counselingApi.delete(parseInt(id));
      // if (result.success) {
      //   router.push("/counseling");
      // } else {
      //   alert(result.error || "Gagal menghapus sesi");
      // }
      alert("Fitur hapus belum tersedia. Hubungi administrator.");
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/counseling"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Kembali ke dashboard konseling"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Konseling
            </h1>
            <p className="text-gray-600 mt-1">Data tidak ditemukan</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Sesi konseling tidak ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">ID sesi: {id}</p>
            <Link href="/counseling" className="mt-4 inline-block">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(session.status);

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/counseling"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Kembali ke dashboard konseling"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-purple-600" />
              Detail Sesi Konseling
            </h1>
            <p className="text-gray-600 mt-1">
              Informasi lengkap sesi konseling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSession}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
          <Link
            href={`/counseling/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50"
            aria-label="Hapus sesi konseling"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Hapus
          </button>
        </div>
      </div>

      {/* Session Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{session.topic}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  session.status
                )}`}
              >
                <StatusIcon className="inline w-4 h-4 mr-1" />
                {session.status}
              </span>
              {session.scheduledAt && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {formatDate(session.scheduledAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Santri and Counselor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Data Santri
              </h2>
              {session.santri ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nama
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {session.santri.name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Jenis Kelamin
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {session.santri.gender === "Pria"
                          ? "Laki-laki"
                          : "Perempuan"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Data santri tidak ditemukan</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Data Konselor
              </h2>
              {session.counselor ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nama
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {session.counselor.name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {session.counselor.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Konselor belum ditentukan</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes and Recommendations */}
          {session.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Catatan
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {session.notes}
                </p>
              </div>
            </div>
          )}

          {session.recommendation && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                Rekomendasi
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {session.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Kelola Status
            </h2>
            <div className="space-y-3">
              {session.status === CounselingStatus.PLANNED && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(CounselingStatus.ONGOING)}
                    disabled={updating}
                    className="flex items-center gap-3 p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition w-full text-left disabled:opacity-50"
                  >
                    <Clock3 className="w-5 h-5" />
                    <span className="font-medium">Mulai Sesi</span>
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(CounselingStatus.CANCELLED)
                    }
                    disabled={updating}
                    className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition w-full text-left disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Batalkan Sesi</span>
                  </button>
                </>
              )}
              {session.status === CounselingStatus.ONGOING && (
                <button
                  onClick={() => handleStatusUpdate(CounselingStatus.COMPLETED)}
                  disabled={updating}
                  className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition w-full text-left disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Selesaikan Sesi</span>
                </button>
              )}
              {(session.status === CounselingStatus.COMPLETED ||
                session.status === CounselingStatus.CANCELLED) && (
                <button
                  onClick={() => handleStatusUpdate(CounselingStatus.PLANNED)}
                  disabled={updating}
                  className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition w-full text-left disabled:opacity-50"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Jadwalkan Ulang</span>
                </button>
              )}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Status saat ini:</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {session.status}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Sistem
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Dibuat Pada
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(session.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Diperbarui Pada
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  ID Sesi
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {session.id}
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
                href={`/counseling/${id}/edit`}
                className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
              >
                <Edit className="w-5 h-5" />
                <span className="font-medium">Edit Sesi</span>
              </Link>
              <button
                onClick={() => fetchSession()}
                disabled={refreshing}
                className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition w-full text-left disabled:opacity-50"
              >
                {refreshing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                <span className="font-medium">Refresh Data</span>
              </button>
              <Link
                href="/counseling/create"
                className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Tambah Sesi Baru</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
