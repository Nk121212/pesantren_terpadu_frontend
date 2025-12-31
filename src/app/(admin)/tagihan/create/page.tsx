"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { santriApi, invoicesApi, type Santri, type Paginated } from "@/lib/api";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

interface FormData {
  santriId: number;
  amount: number;
  description: string;
  dueDate: string;
}

export default function CreateTagihanPage() {
  const router = useRouter();

  const [santri, setSantri] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    santriId: 0,
    amount: 0,
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    santriApi
      .list()
      .then((response) => {
        if (response.success && response.data) {
          const paginatedResponse = response.data as Paginated<Santri>;
          setSantri(paginatedResponse.items || []);
        } else {
          setError(response.error || "Gagal memuat data santri");
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
      const res = await invoicesApi.create({
        santriId: formData.santriId,
        amount: formData.amount,
        description: formData.description,
        dueDate: formData.dueDate,
      });

      if (res.success) {
        alert("Tagihan berhasil dibuat!");
        router.push("/tagihan");
      } else {
        setError(res.error || "Gagal membuat tagihan");
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
      {}
      <div className="flex items-center gap-4">
        <Link
          href="/tagihan"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Buat Tagihan Baru
          </h1>
          <p className="text-gray-600">Buat tagihan untuk santri</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

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
            {submitting ? "Membuat..." : "Buat Tagihan"}
          </button>
        </div>
      </form>
    </div>
  );
}
