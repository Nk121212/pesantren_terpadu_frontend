"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  invoicesApi,
  paymentsApi,
  type Invoice,
  PaymentMethod,
  type CreatePaymentDto,
  PaymentStatus,
} from "@/lib/api";
import {
  ArrowLeft,
  CreditCard,
  Building,
  QrCode,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

export default function BayarTagihanPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = Number.parseInt(params.id as string);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    PaymentMethod.BANK_TRANSFER
  );
  const [amount, setAmount] = useState(0);
  const [proofUrl, setProofUrl] = useState("");

  useEffect(() => {
    if (!invoiceId) {
      setError("ID tagihan tidak valid");
      setLoading(false);
      return;
    }

    invoicesApi
      .get(invoiceId)
      .then((res) => {
        if (res.success && res.data) {
          setInvoice(res.data);
          setAmount(res.data.amount);
        } else {
          setError(res.error || "Gagal memuat data tagihan");
        }
      })
      .catch((err) => {
        console.error("Error fetching invoice:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      })
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handleManualPayment = async () => {
    if (!invoice) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload: CreatePaymentDto = {
        invoiceId: invoice.id,
        amount: amount,
        method: selectedMethod,
        status: PaymentStatus.PENDING,
        proofUrl: proofUrl || undefined,
      };

      const res = await paymentsApi.create(payload);
      if (res.success) {
        alert("Pembayaran berhasil dibuat!");
        router.push(`/tagihan/${invoice.id}`);
      } else {
        setError(res.error || "Gagal membuat pembayaran");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuitkuPayment = async () => {
    if (!invoice) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await paymentsApi.createDuitkuPayment(
        invoice.id,
        selectedMethod,
        amount
      );
      if (res.success && res.data) {
        // Redirect ke payment URL Duitku
        globalThis.location.href = res.data.paymentUrl;
      } else {
        setError(res.error || "Gagal membuat pembayaran Duitku");
      }
    } catch (err) {
      console.error("Duitku payment error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    {
      value: PaymentMethod.BANK_TRANSFER,
      label: "Bank Transfer",
      icon: Building,
      description: "Transfer melalui bank",
      color: "blue",
    },
    {
      value: PaymentMethod.VA,
      label: "Virtual Account",
      icon: CreditCard,
      description: "Bayar via Virtual Account",
      color: "green",
    },
    {
      value: PaymentMethod.QRIS,
      label: "QRIS",
      icon: QrCode,
      description: "Scan QR code untuk bayar",
      color: "purple",
    },
    {
      value: PaymentMethod.EWALLET,
      label: "E-Wallet",
      icon: Smartphone,
      description: "OVO, Gopay, Dana, dll",
      color: "orange",
    },
  ];

  // Helper function untuk class names dengan warna dinamis
  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = "p-4 border-2 rounded-lg text-left transition-all";

    if (isSelected) {
      const colorClasses = {
        blue: "border-blue-500 bg-blue-50",
        green: "border-green-500 bg-green-50",
        purple: "border-purple-500 bg-purple-50",
        orange: "border-orange-500 bg-orange-50",
      };
      return `${baseClasses} ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
      }`;
    }

    return `${baseClasses} border-gray-200 hover:border-gray-300`;
  };

  const getIconColorClasses = (color: string) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
    };
    return `p-2 rounded-full ${
      colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
    }`;
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

  const totalPaid = invoice.payments
    ? invoice.payments
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + p.amount, 0)
    : 0;
  const remaining = invoice.amount - totalPaid;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/tagihan/${invoice.id}`}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bayar Tagihan</h1>
          <p className="text-gray-600">Lakukan pembayaran untuk tagihan</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Invoice Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Detail Tagihan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Santri</p>
            <p className="font-medium text-gray-900">
              {invoice.santri?.name || `Santri ${invoice.santriId}`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Deskripsi</p>
            <p className="font-medium text-gray-900">{invoice.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Tagihan</p>
            <p className="font-bold text-lg text-gray-900">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(invoice.amount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sisa yang harus dibayar</p>
            <p className="font-bold text-lg text-green-600">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(remaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pilih Metode Pembayaran
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setSelectedMethod(method.value)}
              className={getColorClasses(
                method.color,
                selectedMethod === method.value
              )}
              aria-label={`Pilih metode pembayaran ${method.label}`}
            >
              <div className="flex items-center gap-3">
                <div className={getIconColorClasses(method.color)}>
                  <method.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{method.label}</p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Detail Pembayaran
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Jumlah Bayar
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number.parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max={remaining}
              aria-describedby="amount-help"
            />
            <p id="amount-help" className="text-sm text-gray-500 mt-1">
              Maksimal:{" "}
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(remaining)}
            </p>
          </div>

          <div>
            <label
              htmlFor="proofUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL Bukti Pembayaran (Opsional)
            </label>
            <input
              id="proofUrl"
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://example.com/bukti.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Link
          href={`/tagihan/${invoice.id}`}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Batal
        </Link>

        <button
          onClick={handleManualPayment}
          disabled={submitting || amount <= 0 || amount > remaining}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {submitting ? "Memproses..." : "Bayar Manual"}
        </button>

        <button
          onClick={handleDuitkuPayment}
          disabled={submitting || amount <= 0 || amount > remaining}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {submitting ? "Memproses..." : "Bayar via Duitku"}
        </button>
      </div>
    </div>
  );
}
