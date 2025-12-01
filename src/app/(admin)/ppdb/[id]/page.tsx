"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ppdbApi, type PpdbApplicant } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
} from "lucide-react";

export default function PpdbDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [applicant, setApplicant] = useState<PpdbApplicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const applicantId = Number(params.id);

  useEffect(() => {
    if (applicantId) {
      loadApplicant();
    }
  }, [applicantId]);

  const loadApplicant = async () => {
    try {
      setLoading(true);
      const result = await ppdbApi.getApplicant(applicantId);

      if (result.success) {
        setApplicant(result.data || null);
      } else {
        alert(result.error || "Gagal memuat data pendaftar");
        router.push("/ppdb");
      }
    } catch (error) {
      console.error("Failed to load applicant:", error);
      alert("Terjadi kesalahan saat memuat data pendaftar");
      router.push("/ppdb");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: "ACCEPTED" | "REJECTED") => {
    if (!user?.id) {
      alert("User ID tidak ditemukan");
      return;
    }

    const actionText = status === "ACCEPTED" ? "menerima" : "menolak";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} pendaftar ini?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const result = await ppdbApi.updateStatus(applicantId, { status });

      if (result.success) {
        setApplicant(result.data || null);
        alert(`Pendaftar berhasil di${actionText}`);
      } else {
        alert(result.error || `Gagal ${actionText} pendaftar`);
      }
    } catch (error) {
      console.error("Update status error:", error);
      alert(`Terjadi kesalahan saat ${actionText} pendaftar`);
    } finally {
      setActionLoading(false);
    }
  };

  const canUpdateStatus = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Menunggu Review",
      },
      ACCEPTED: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Diterima",
      },
      REJECTED: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Ditolak",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${config.color} font-medium`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Menunggu Pembayaran",
      },
      SUCCESS: {
        color: "bg-green-100 text-green-800",
        label: "Pembayaran Lunas",
      },
      FAILED: {
        color: "bg-red-100 text-red-800",
        label: "Pembayaran Gagal",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Data Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-4">
            Pendaftar dengan ID tersebut tidak ditemukan.
          </p>
          <Link
            href="/ppdb"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar PPDB
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/ppdb"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Pendaftaran
            </h1>
            <p className="text-gray-600 mt-1">
              No. Registrasi:{" "}
              <span className="font-mono font-medium">
                {applicant.registrationNo}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(applicant.status)}
          {getPaymentStatusBadge(applicant.paymentStatus)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informasi Utama */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Calon Santri */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Data Calon Santri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <p className="text-gray-900 font-medium">{applicant.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin
                </label>
                <p className="text-gray-900 capitalize">{applicant.gender}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Lahir
                </label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {applicant.birthDate ? formatDate(applicant.birthDate) : "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {applicant.email || "-"}
                </p>
              </div>
            </div>

            {applicant.address && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <p className="text-gray-900 flex items-start gap-1">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="whitespace-pre-line">
                    {applicant.address}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Data Wali */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Data Orang Tua/Wali
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Wali
                </label>
                <p className="text-gray-900">{applicant.guardianName || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {applicant.guardianPhone || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Dokumen */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Dokumen Pendaftaran
            </h2>

            {applicant.documents && applicant.documents.length > 0 ? (
              <div className="space-y-3">
                {applicant.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {doc.fileName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Diupload: {formatDateTime(doc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        window.open(
                          `${process.env.NEXT_PUBLIC_API_URL}${doc.filePath}`,
                          "_blank"
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Belum ada dokumen yang diupload</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Status & Aksi */}
        <div className="space-y-6">
          {/* Informasi Pendaftaran */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Pendaftaran
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Daftar
                </label>
                <p className="text-gray-900">
                  {formatDateTime(applicant.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terakhir Diupdate
                </label>
                <p className="text-gray-900">
                  {formatDateTime(applicant.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Aksi Admin */}
          {canUpdateStatus && applicant.status === "PENDING" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tindakan Admin
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => handleUpdateStatus("ACCEPTED")}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Terima Pendaftar
                </button>

                <button
                  onClick={() => handleUpdateStatus("REJECTED")}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Tolak Pendaftar
                </button>
              </div>
            </div>
          )}

          {/* Upload Dokumen */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Dokumen
            </h3>

            <Link
              href={`/ppdb/${applicant.id}/document`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Upload Dokumen Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
