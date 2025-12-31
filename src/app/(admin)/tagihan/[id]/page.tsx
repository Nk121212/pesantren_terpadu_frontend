"use client";

import { useEffect, useState } from "react";
import {
  invoicesApi,
  paymentsApi,
  type Invoice,
  type Payment,
} from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Trash2,
} from "lucide-react";

export default function TagihanDetailPage() {
  const params = useParams();
  const invoiceId = parseInt(params.id as string);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      setError("ID tagihan tidak valid");
      return;
    }

    const fetchData = async () => {
      try {
        // Load invoice detail
        const invoiceResponse = await invoicesApi.get(invoiceId);

        if (invoiceResponse.success && invoiceResponse.data) {
          setInvoice(invoiceResponse.data);

          // Load payments for this invoice
          const paymentsResponse = await paymentsApi.getByInvoice(invoiceId);
          if (paymentsResponse.success && paymentsResponse.data) {
            setPayments(paymentsResponse.data);
          }
        } else {
          setError(invoiceResponse.error || "Gagal memuat data tagihan");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      PARTIAL: {
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
        label: "Partial",
      },
      PAID: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Lunas",
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Dibatalkan",
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
        icon: Clock,
        label: "Pending",
      },
      SUCCESS: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Sukses",
      },
      FAILED: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Gagal",
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pembayaran ini?")) return;

    try {
      const res = await paymentsApi.delete(paymentId);
      if (res.success) {
        alert("Pembayaran berhasil dihapus!");
        // Refresh payments data
        const paymentsRes = await paymentsApi.getByInvoice(invoiceId);
        if (paymentsRes.success && paymentsRes.data) {
          setPayments(paymentsRes.data);
        }
      } else {
        alert(res.error || "Gagal menghapus pembayaran");
      }
    } catch (err) {
      console.error("Error deleting payment:", err);
      alert("Terjadi kesalahan saat menghapus pembayaran");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {error || "Tagihan tidak ditemukan"}
          </h1>
          <Link
            href="/tagihan"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Kembali ke daftar tagihan
          </Link>
        </div>
      </div>
    );
  }

  const totalPaid = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const remaining = invoice.amount - totalPaid;
  const progressPercentage = Math.min(100, (totalPaid / invoice.amount) * 100);

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/tagihan"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Tagihan</h1>
            <p className="text-gray-600">
              Informasi lengkap tagihan dan pembayaran
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/tagihan/${invoice.id}/bayar`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <DollarSign className="w-4 h-4" />
            Bayar Tagihan
          </Link>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Info */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informasi Tagihan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Santri</p>
              <p className="font-medium text-gray-900">
                {invoice.santri?.name || `Santri ${invoice.santriId}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="mt-1">{getStatusBadge(invoice.status)}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deskripsi</p>
              <p className="font-medium text-gray-900">{invoice.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tanggal Dibuat</p>
              <p className="font-medium text-gray-900">
                {formatDate(invoice.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Jatuh Tempo</p>
              <p className="font-medium text-gray-900">
                {formatDate(invoice.dueDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tagihan</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(invoice.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Progress Pembayaran
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Terkumpul</span>
                <span>{formatCurrency(totalPaid)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalPaid)}
                </p>
                <p className="text-sm text-gray-600">Total Dibayar</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(remaining)}
                </p>
                <p className="text-sm text-gray-600">Sisa Tagihan</p>
              </div>
            </div>

            {remaining > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Tagihan belum lunas
                </p>
              </div>
            )}

            {invoice.status === "PAID" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 text-center">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Tagihan sudah lunas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payments History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Riwayat Pembayaran
          </h2>
        </div>

        <div className="overflow-x-auto">
          {payments.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Metode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Bukti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900 font-medium">
                          {new Date(payment.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleTimeString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4">
                      {payment.proofUrl ? (
                        <a
                          href={payment.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat Bukti
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Pembayaran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Belum ada riwayat pembayaran
              </p>
              <Link
                href={`/tagihan/${invoice.id}/bayar`}
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Lakukan Pembayaran Pertama
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
