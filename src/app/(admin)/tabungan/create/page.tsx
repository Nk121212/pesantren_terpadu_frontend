"use client";

import { useState, useEffect } from "react";
import {
  tabunganApi,
  santriApi,
  type Santri,
  type CreateSavingsRequest,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, PiggyBank, Users, AlertCircle } from "lucide-react";

export default function CreateTabunganPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [santriLoading, setSantriLoading] = useState(true);
  const [error, setError] = useState<string>(""); // Tambahkan state error

  const [form, setForm] = useState<CreateSavingsRequest>({
    santriId: 0,
  });

  useEffect(() => {
    const fetchSantri = async () => {
      try {
        const response = await santriApi.list({ page: 1, per_page: 100 });

        if (response && response.data) {
          setSantriList(response.data);
        } else {
          setError("Gagal memuat data santri");
        }
      } catch (error) {
        console.error("Failed to fetch santri:", error);
        setError("Gagal memuat data santri");
      } finally {
        setSantriLoading(false);
      }
    };

    fetchSantri();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
    // Clear error when user changes selection
    setError("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!form.santriId || form.santriId === 0) {
      setError("Pilih santri terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const result = await tabunganApi.create(form);

      if (result.success) {
        alert("Rekening tabungan berhasil dibuat!");
        router.push("/tabungan");
        router.refresh(); // Refresh the page to show new data
      } else {
        setError(result.error || "Gagal membuat rekening tabungan");
      }
    } catch (error) {
      console.error("Create savings error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan saat membuat rekening");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {}
      <div className="flex items-center gap-4">
        <Link
          href="/tabungan"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-blue-600" />
            Buat Rekening Tabungan
          </h1>
          <p className="text-gray-600 mt-1">
            Buat rekening tabungan baru untuk santri
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Santri *
            </label>
            <select
              name="santriId"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={form.santriId}
              onChange={handleChange}
              disabled={santriLoading}
            >
              <option value="">Pilih Santri</option>
              {santriList.map((santri) => (
                <option key={santri.id} value={santri.id}>
                  {santri.name} (ID: {santri.id})
                </option>
              ))}
            </select>
            {santriLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Memuat data santri...
              </p>
            )}
            {santriList.length === 0 && !santriLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Tidak ada data santri tersedia
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Informasi</p>
                <p className="text-sm text-blue-600">
                  Rekening tabungan akan dibuat untuk santri yang dipilih.
                  Santri dapat melakukan setoran dan penarikan melalui
                  transaksi.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/tabungan"
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? "Membuat..." : "Buat Rekening"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
