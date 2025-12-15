"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  santriApi,
  paymentsApi,
  type Santri,
  type CreateRecurringInvoiceDto,
  PaymentMethod,
  type Paginated,
} from "@/lib/api";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function CreateRecurringInvoicePage() {
  const router = useRouter();

  const [santri, setSantri] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateRecurringInvoiceDto>({
    santriId: 0,
    amount: 0,
    description: "",
    dueDate: "",
    method: PaymentMethod.BANK_TRANSFER,
  });

  useEffect(() => {
    santriApi
      .list()
      .then((response) => {
        if (response?.data) {
          const paginatedResponse = response.data;
          setSantri(paginatedResponse || []);
        } else {
          setError("Gagal memuat data santri");
        }
      })
      .catch((err) => {
        console.error("Error fetching santri:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.santriId || !formData.amount || !formData.description) {
      alert("Harap isi semua field yang wajib!");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await paymentsApi.createRecurringInvoice(formData);
      if (res.success) {
        alert("Tagihan berulang berhasil dibuat!");
        router.push("/tagihan");
      } else {
        setError(res.error || "Gagal membuat tagihan berulang");
      }
    } catch (err) {
      console.error("Error creating recurring invoice:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof CreateRecurringInvoiceDto,
    value: string | number | PaymentMethod
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const templateInvoices = [
    {
      description: "SPP Bulanan",
      amount: 500000,
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 25)
        .toISOString()
        .split("T")[0],
    },
    {
      description: "Uang Gedung",
      amount: 2500000,
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 30)
        .toISOString()
        .split("T")[0],
    },
    {
      description: "Uang Makan",
      amount: 750000,
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10)
        .toISOString()
        .split("T")[0],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && santri.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/tagihan"
            className="text-blue-600 hover:underline inline-block"
          >
            Kembali ke daftar tagihan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/tagihan"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Buat Tagihan Berulang
          </h1>
          <p className="text-gray-600">
            Buat tagihan yang akan diulang secara otomatis
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Template Buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Template Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {templateInvoices.map((template, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  description: template.description,
                  amount: template.amount,
                  dueDate: template.dueDate,
                }));
              }}
              className="p-3 border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <p className="font-medium text-gray-900">
                {template.description}
              </p>
              <p className="text-sm text-gray-600">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(template.amount)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Santri *
          </label>
          <select
            value={formData.santriId}
            onChange={(e) =>
              handleChange("santriId", Number.parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value={0}>Pilih Santri</option>
            {santri.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (ID: {s.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Tagihan *
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Contoh: SPP Bulan Januari 2024"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jumlah *
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) =>
              handleChange("amount", Number.parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Jatuh Tempo
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metode Pembayaran Default
          </label>
          <select
            value={formData.method}
            onChange={(e) =>
              handleChange("method", e.target.value as PaymentMethod)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
            <option value={PaymentMethod.VA}>Virtual Account</option>
            <option value={PaymentMethod.QRIS}>QRIS</option>
            <option value={PaymentMethod.EWALLET}>E-Wallet</option>
          </select>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Link
            href="/tagihan"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            <Plus className="w-4 h-4" />
            {submitting ? "Membuat..." : "Buat Tagihan Berulang"}
          </button>
        </div>
      </form>
    </div>
  );
}
