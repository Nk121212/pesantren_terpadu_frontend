"use client";

import { useEffect, useState } from "react";
import { ppdbApi, type PpdbApplicant } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  RefreshCw,
  Loader2,
  FileText,
} from "lucide-react";

export default function PpdbPage() {
  const { user } = useAuth();
  const [data, setData] = useState<PpdbApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await ppdbApi.listApplicants();
      if (result.success) {
        // Pastikan data tidak undefined
        setData(result.data || []);
      } else {
        alert(result.error || "Gagal memuat data pendaftar");
        setData([]); // Set empty array jika error
      }
    } catch (error) {
      console.error("Failed to load applicants:", error);
      alert("Terjadi kesalahan saat memuat data pendaftar");
      setData([]); // Set empty array jika error
    } finally {
      setLoading(false);
    }
  };

  // Safe string function untuk handle undefined/null
  const safeLowerCase = (str: string | undefined | null): string => {
    return str ? str.toLowerCase() : "";
  };

  const safeIncludes = (
    str: string | undefined | null,
    search: string
  ): boolean => {
    return safeLowerCase(str).includes(safeLowerCase(search));
  };

  const filteredApplicants = (data || []).filter((applicant) => {
    if (!applicant) return false;

    const matchesSearch =
      safeIncludes(applicant.name, search) ||
      safeIncludes(applicant.registrationNo, search) ||
      safeIncludes(applicant.guardianName, search) ||
      safeIncludes(applicant.email, search);

    const matchesStatus =
      statusFilter === "ALL" || applicant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (
    applicantId: number,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    if (!user?.id) {
      alert("User ID tidak ditemukan");
      return;
    }

    const actionText = status === "ACCEPTED" ? "menerima" : "menolak";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} pendaftar ini?`)) {
      return;
    }

    try {
      setActionLoading(applicantId);
      const result = await ppdbApi.updateStatus(applicantId, { status });

      if (result.success) {
        setData((prev) =>
          prev.map((a) => (a?.id === applicantId ? result.data! : a))
        );
        alert(`Pendaftar berhasil di${actionText}`);
      } else {
        alert(result.error || `Gagal ${actionText} pendaftar`);
      }
    } catch (error) {
      console.error("Update status error:", error);
      alert(`Terjadi kesalahan saat ${actionText} pendaftar`);
    } finally {
      setActionLoading(null);
    }
  };

  const canUpdateStatus = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Menunggu",
      },
      ACCEPTED: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Diterima",
      },
      REJECTED: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Ditolak",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending",
      },
      SUCCESS: {
        color: "bg-green-100 text-green-800",
        label: "Lunas",
      },
      FAILED: {
        color: "bg-red-100 text-red-800",
        label: "Gagal",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // Statistics dengan safe handling
  const stats = {
    total: data.length,
    pending: data.filter((a) => a?.status === "PENDING").length,
    accepted: data.filter((a) => a?.status === "ACCEPTED").length,
    rejected: data.filter((a) => a?.status === "REJECTED").length,
    withDocuments: data.filter((a) => a?.documents && a.documents.length > 0)
      .length,
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
            <User className="w-7 h-7 text-blue-600" />
            Penerimaan Peserta Didik Baru (PPDB)
          </h1>
          <p className="text-gray-600 mt-1">Kelola pendaftaran santri baru</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/ppdb/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Pendaftaran Baru
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Pendaftar
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Menunggu Review
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Diterima</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.accepted}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Dengan Dokumen
              </p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.withDocuments}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama, no registrasi, atau wali..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="ACCEPTED">Diterima</option>
            <option value="REJECTED">Ditolak</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  No Registrasi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Calon Santri
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Wali / Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dokumen
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal Daftar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pembayaran
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplicants.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-mono font-medium text-blue-600">
                        {applicant.registrationNo || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {applicant.name || "-"}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {applicant.gender || "-"} •{" "}
                        {formatDate(applicant.birthDate)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {applicant.guardianName || "-"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {applicant.guardianPhone || "-"}
                      </p>
                      {applicant.email && (
                        <p className="text-sm text-blue-600">
                          {applicant.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {applicant.documents?.length || 0} file
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600">
                      {formatDate(applicant.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {applicant.status ? getStatusBadge(applicant.status) : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {applicant.paymentStatus
                      ? getPaymentStatusBadge(applicant.paymentStatus)
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/ppdb/${applicant.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {canUpdateStatus && applicant.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(applicant.id, "ACCEPTED")
                            }
                            disabled={actionLoading === applicant.id}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Terima Pendaftar"
                          >
                            {actionLoading === applicant.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Terima
                          </button>

                          <button
                            onClick={() =>
                              handleUpdateStatus(applicant.id, "REJECTED")
                            }
                            disabled={actionLoading === applicant.id}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Tolak Pendaftar"
                          >
                            {actionLoading === applicant.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Tolak
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplicants.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {data.length === 0
                ? "Belum ada pendaftar PPDB"
                : "Tidak ditemukan pendaftar yang sesuai filter"}
            </p>
            {search && (
              <p className="text-gray-400 mt-2">
                Tidak ditemukan pendaftar dengan kata kunci {search}
              </p>
            )}
            {data.length === 0 && (
              <Link
                href="/ppdb/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mt-4"
              >
                <Plus className="w-4 h-4" />
                Tambah Pendaftar Pertama
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
