"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  counselingApi,
  counselorsApi,
  santriApi,
  CounselingStatus,
  Santri,
} from "@/lib/api";
import {
  Calendar,
  User,
  Users,
  Clock,
  AlertCircle,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";

interface Counselor {
  id: number;
  name: string;
  email: string;
}

// Helper function untuk mengekstrak data dari response
function extractDataFromResponse<T>(response: unknown): T[] {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response as T[];
  }

  if (typeof response === "object" && response !== null) {
    const obj = response as Record<string, unknown>;

    // Format: { success: true, data: T[] }
    if (
      "success" in obj &&
      obj.success === true &&
      "data" in obj &&
      Array.isArray(obj.data)
    ) {
      return obj.data as T[];
    }

    // Format: { data: T[] }
    if ("data" in obj && Array.isArray(obj.data)) {
      return obj.data as T[];
    }
  }

  return [];
}

export default function CreateCounselingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [counselorList, setCounselorList] = useState<Counselor[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    santriId: "",
    counselorId: "",
    topic: "",
    notes: "",
    recommendation: "",
    status: CounselingStatus.PLANNED,
    scheduledAt: "",
  });

  const fetchData = useCallback(async () => {
    try {
      // Fetch santri list
      const santriRes = await santriApi.list({ per_page: 100 });
      const santriData = extractDataFromResponse<Santri>(santriRes);
      setSantriList(santriData);

      // Fetch counselor list
      const counselors = await counselorsApi.list();
      setCounselorList(counselors);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.santriId) {
      newErrors.santriId = "Santri harus dipilih";
    }

    if (!formData.topic.trim()) {
      newErrors.topic = "Topik konseling harus diisi";
    }

    if (!formData.status) {
      newErrors.status = "Status harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        santriId: parseInt(formData.santriId),
        counselorId: formData.counselorId
          ? parseInt(formData.counselorId)
          : undefined,
        topic: formData.topic,
        notes: formData.notes || undefined,
        recommendation: formData.recommendation || undefined,
        status: formData.status,
        scheduledAt: formData.scheduledAt || undefined,
      };

      const result = await counselingApi.create(payload);

      if (result.success) {
        router.push("/counseling");
      } else {
        alert(result.error || "Gagal membuat sesi konseling");
      }
    } catch (error) {
      console.error("Error creating counseling session:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
              Buat Sesi Konseling Baru
            </h1>
            <p className="text-gray-600 mt-1">
              Isi form untuk membuat sesi konseling baru
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/counseling"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Batal
          </Link>
          <button
            type="submit"
            form="counseling-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Sesi
              </>
            )}
          </button>
        </div>
      </div>

      <form id="counseling-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Data Santri
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="santriId"
              >
                Pilih Santri <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="santriId"
                  name="santriId"
                  value={formData.santriId}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.santriId ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white`}
                  aria-invalid={!!errors.santriId}
                  aria-describedby={
                    errors.santriId ? "santriId-error" : undefined
                  }
                  required
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.map((santri) => (
                    <option key={santri.id} value={santri.id}>
                      {santri.name} (
                      {santri.gender === "Pria" ? "Laki-laki" : "Perempuan"})
                    </option>
                  ))}
                </select>
                {errors.santriId && (
                  <p id="santriId-error" className="mt-1 text-sm text-red-600">
                    {errors.santriId}
                  </p>
                )}
              </div>
              {santriList.length === 0 && (
                <p className="text-sm text-yellow-600 mt-2">
                  <AlertCircle className="inline w-4 h-4 mr-1" />
                  Belum ada data santri. Tambahkan santri terlebih dahulu.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Counselor Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Data Konselor
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="counselorId"
              >
                Pilih Konselor (Opsional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="counselorId"
                  name="counselorId"
                  value={formData.counselorId}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                >
                  <option value="">-- Pilih Konselor --</option>
                  {counselorList.map((counselor) => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.name} ({counselor.email})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Biarkan kosong jika konselor belum ditentukan
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Detail Sesi Konseling
          </h2>

          <div className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="topic"
              >
                Topik Konseling <span className="text-red-500">*</span>
              </label>
              <input
                id="topic"
                name="topic"
                type="text"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Contoh: Masalah konsentrasi belajar, emosional, dll."
                className={`w-full px-4 py-3 border ${
                  errors.topic ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                aria-invalid={!!errors.topic}
                aria-describedby={errors.topic ? "topic-error" : undefined}
                required
              />
              {errors.topic && (
                <p id="topic-error" className="mt-1 text-sm text-red-600">
                  {errors.topic}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="status"
                >
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.status ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  aria-invalid={!!errors.status}
                  aria-describedby={errors.status ? "status-error" : undefined}
                  required
                >
                  <option value={CounselingStatus.PLANNED}>
                    Direncanakan (PLANNED)
                  </option>
                  <option value={CounselingStatus.ONGOING}>
                    Berlangsung (ONGOING)
                  </option>
                  <option value={CounselingStatus.COMPLETED}>
                    Selesai (COMPLETED)
                  </option>
                  <option value={CounselingStatus.CANCELLED}>
                    Dibatalkan (CANCELLED)
                  </option>
                </select>
                {errors.status && (
                  <p id="status-error" className="mt-1 text-sm text-red-600">
                    {errors.status}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="scheduledAt"
                >
                  Jadwal Konseling (Opsional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="scheduledAt"
                    name="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Biarkan kosong untuk menandai belum terjadwal
                </p>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="notes"
              >
                Catatan (Opsional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Catatan awal atau informasi latar belakang..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Contoh: Santri sering terlihat sedih di kelas, nilai menurun,
                dll.
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="recommendation"
              >
                Rekomendasi Awal (Opsional)
              </label>
              <textarea
                id="recommendation"
                name="recommendation"
                value={formData.recommendation}
                onChange={handleChange}
                placeholder="Rekomendasi atau saran awal untuk penanganan..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Contoh: Perlu konseling reguler, koordinasi dengan orang tua,
                dll.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">
                Catatan Penting
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
                <li>Pastikan data santri sudah benar sebelum disimpan</li>
                <li>Topik konseling harus jelas dan spesifik</li>
                <li>Status dapat diubah nanti sesuai perkembangan sesi</li>
                <li>Jadwal dapat ditentukan kemudian jika belum pasti</li>
                <li>Sistem akan mencatat semua aktivitas konseling</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
