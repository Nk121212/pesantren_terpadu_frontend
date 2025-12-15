"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { tahfidzApi, type Santri, type TahfidzRecord } from "@/lib/api";
import {
  BookOpen,
  ArrowLeft,
  Edit,
  User,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Trash2,
  ChevronRight,
  Printer,
  Download,
  Share2,
  TrendingUp,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default function TahfidzDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<TahfidzRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [santriRecords, setSantriRecords] = useState<TahfidzRecord[]>([]);

  const id = Number.parseInt(params.id as string);

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tahfidzApi.getById(id);

      console.log("Detail API Response:", response);

      if (response?.success && response.data) {
        // Data langsung ada di response.data (tidak ada nesting tambahan)
        const recordData = response.data;
        console.log("Record data:", recordData);
        setRecord(recordData);

        // Fetch all records to get santri's other records
        const allRecordsResponse = await tahfidzApi.getAll();

        console.log("All records response:", allRecordsResponse);

        if (allRecordsResponse?.success && allRecordsResponse.data) {
          let allRecords: TahfidzRecord[] = [];

          // Handle response structure from getAll
          if (
            allRecordsResponse.data?.data &&
            Array.isArray(allRecordsResponse.data.data)
          ) {
            // Structure: { success: true, data: { data: [...], meta: {...} } }
            allRecords = allRecordsResponse.data.data;
          } else if (Array.isArray(allRecordsResponse.data)) {
            // Structure: { success: true, data: [...] }
            allRecords = allRecordsResponse.data;
          }

          // Filter records by the same santri
          const filteredRecords = allRecords.filter(
            (r) => r.santriId === recordData.santriId && r.id !== id
          );

          console.log("Santri's other records:", filteredRecords);
          setSantriRecords(filteredRecords.slice(0, 5));
        }
      } else {
        throw new Error(response?.error || "Catatan hafalan tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching record:", error);
      setError(error instanceof Error ? error.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRecord();
    }
  }, [id, fetchRecord]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await tahfidzApi.delete(id);

      console.log("Delete response:", response);

      if (response?.success) {
        router.push("/tahfidz");
        router.refresh();
      } else {
        throw new Error(response?.error || "Gagal menghapus catatan");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      setError("Gagal menghapus catatan");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string | Date): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Tanggal tidak valid";
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-600";
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/tahfidz"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">
              {error || "Data tidak ditemukan"}
            </p>
            <Link
              href="/tahfidz"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total pages
  const totalPages =
    record.pageEnd && record.pageStart
      ? record.pageEnd - record.pageStart + 1
      : 0;

  // Calculate statistics
  const totalHafalan = santriRecords.length + 1;
  const uniqueJuz = new Set([
    record.juz,
    ...santriRecords.map((r) => r.juz).filter(Boolean),
  ]).size;

  const allScores = [
    record.score,
    ...santriRecords
      .map((r) => r.score)
      .filter((s) => s !== undefined && s !== null),
  ].filter((s) => s !== undefined && s !== null) as number[];

  const averageScore =
    allScores.length > 0
      ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
      : "-";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/tahfidz"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Hafalan
              </h1>
              <p className="text-gray-600 mt-1">
                Catatan hafalan untuk {record.santri?.name || "Santri"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Konfirmasi Hapus
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus catatan hafalan ini? Tindakan
              ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Record Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Record Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Informasi Hafalan
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getJuzColor(
                  record.juz
                )}`}
              >
                Juz {record.juz || "-"}
              </span>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Halaman
                  </label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900">
                      {record.pageStart || 0} - {record.pageEnd || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Total {totalPages} halaman
                    </p>
                  </div>
                </div>

                {record.score !== undefined && record.score !== null && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nilai
                    </label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-3xl font-bold ${getScoreColor(
                            record.score
                          )}`}
                        >
                          {record.score}
                        </p>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Skala 0-100
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.score >= 90
                              ? "Sangat Baik"
                              : record.score >= 80
                              ? "Baik"
                              : record.score >= 70
                              ? "Cukup"
                              : "Perlu Peningkatan"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${record.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {record.remarks && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Catatan
                  </label>
                  <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">
                      {record.remarks}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Santri Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informasi Santri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Nama Santri
                </label>
                <p className="text-lg font-medium text-gray-900 mt-1">
                  {record.santri?.name || "Tidak diketahui"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Jenis Kelamin
                </label>
                <p className="text-lg font-medium text-gray-900 mt-1">
                  {record.santri?.gender === "Pria" ? "Laki-laki" : "Perempuan"}
                </p>
              </div>

              {record.santri?.birthDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Tanggal Lahir
                  </label>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {new Date(record.santri.birthDate).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>
                </div>
              )}

              {record.santri?.address && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">
                    Alamat
                  </label>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {record.santri.address}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Link
                  href={`/santri/${record.santriId}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Lihat profil santri lengkap
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/tahfidz/create?santriId=${record.santriId}`}
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Hafalan
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Records by Same Santri */}
          {santriRecords.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Riwayat Hafalan Santri Ini
              </h2>

              <div className="space-y-3">
                {santriRecords.map((santriRecord) => (
                  <Link
                    key={santriRecord.id}
                    href={`/tahfidz/${santriRecord.id}`}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getJuzColor(
                          santriRecord.juz
                        )}`}
                      >
                        Juz {santriRecord.juz || "-"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Hlm. {santriRecord.pageStart || 0} -{" "}
                          {santriRecord.pageEnd || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          {santriRecord.createdAt
                            ? new Date(
                                santriRecord.createdAt
                              ).toLocaleDateString("id-ID")
                            : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {santriRecord.score !== undefined &&
                        santriRecord.score !== null && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(
                              santriRecord.score
                            )}`}
                          >
                            {santriRecord.score}
                          </span>
                        )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href={`/tahfidz?santri=${record.santriId}`}
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
                >
                  Lihat semua riwayat hafalan
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Metadata & Actions */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Metadata
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Dibuat pada
                </label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">
                    {record.createdAt ? formatDate(record.createdAt) : "-"}
                  </p>
                </div>
              </div>

              {record.updatedAt && record.updatedAt !== record.createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Diupdate pada
                  </label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">
                      {formatDate(record.updatedAt)}
                    </p>
                  </div>
                </div>
              )}

              {record.teacher && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Pengajar
                  </label>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {record.teacher.name || "Tidak diketahui"}
                    </p>
                    {record.teacher.email && (
                      <p className="text-sm text-gray-600 mt-1">
                        {record.teacher.email}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Aksi Cepat</h3>

            <div className="space-y-3">
              <Link
                href={`/tahfidz/${id}/edit`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition"
              >
                <Edit className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Edit Catatan</p>
                  <p className="text-xs text-gray-500">
                    Update informasi hafalan
                  </p>
                </div>
              </Link>

              <Link
                href={`/tahfidz/create?santriId=${record.santriId}`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition"
              >
                <BookOpen className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Tambah Hafalan</p>
                  <p className="text-xs text-gray-500">
                    Catat hafalan baru untuk santri ini
                  </p>
                </div>
              </Link>

              <Link
                href={`/tahfidz?santri=${record.santriId}`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition"
              >
                <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Riwayat Hafalan</p>
                  <p className="text-xs text-gray-500">
                    Lihat semua catatan santri ini
                  </p>
                </div>
              </Link>

              <Link
                href="/tahfidz"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition"
              >
                <TrendingUp className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Dashboard</p>
                  <p className="text-xs text-gray-500">Lihat semua hafalan</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              Statistik Santri
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Hafalan</span>
                <span className="font-medium text-gray-900">
                  {totalHafalan}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Juz Aktif</span>
                <span className="font-medium text-gray-900">{uniqueJuz}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rata-rata Nilai</span>
                <span className="font-medium text-gray-900">
                  {averageScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
