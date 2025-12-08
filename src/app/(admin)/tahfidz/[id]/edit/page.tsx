"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tahfidzApi, santriApi } from "@/lib/api";
import {
  BookOpen,
  ArrowLeft,
  Save,
  User,
  Award,
  FileText,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface Santri {
  id: number;
  name: string;
  gender: string;
}

interface TahfidzRecord {
  id: number;
  santriId: number;
  juz: number;
  pageStart: number;
  pageEnd: number;
  score?: number;
  remarks?: string;
  teacherId?: number;
  santri?: {
    id: number;
    name: string;
    gender: string;
  };
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function EditTahfidzPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    santriId: "",
    juz: "",
    pageStart: "",
    pageEnd: "",
    score: "",
    remarks: "",
    teacherId: "",
  });

  const id = parseInt(params.id as string);

  // Fetch record data and santri list
  useEffect(() => {
    if (id && !isNaN(id)) {
      fetchData();
    } else {
      setError("ID tidak valid");
      setFetching(false);
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setFetching(true);
      setError(null);
      setNotFound(false);

      // Fetch record data
      const recordResponse = await tahfidzApi.getById(id);

      console.log("Record response:", recordResponse);

      if (!recordResponse.success) {
        throw new Error(recordResponse.error || "Catatan tidak ditemukan");
      }

      // Handle nested response structure
      let recordData: TahfidzRecord | null = null;

      if (recordResponse.data) {
        // Check for nested structure
        if (typeof recordResponse.data === "object") {
          // Direct data structure
          if ("id" in recordResponse.data) {
            recordData = recordResponse.data as TahfidzRecord;
          }
          // Nested structure: { success: true, data: { data: {...} } }
          else if (
            "data" in recordResponse.data &&
            typeof recordResponse.data.data === "object"
          ) {
            const nestedData = recordResponse.data.data as any;
            if (nestedData && "id" in nestedData) {
              recordData = nestedData as TahfidzRecord;
            }
          }
        }
      }

      if (!recordData) {
        throw new Error("Format data tidak valid");
      }

      // Set form data dengan validasi null safety
      setFormData({
        santriId: recordData.santriId?.toString() || "",
        juz: recordData.juz?.toString() || "",
        pageStart: recordData.pageStart?.toString() || "",
        pageEnd: recordData.pageEnd?.toString() || "",
        score: recordData.score?.toString() || "",
        remarks: recordData.remarks || "",
        teacherId: recordData.teacherId?.toString() || "",
      });

      // Fetch santri list
      const santriResponse = await santriApi.list();
      if (Array.isArray(santriResponse)) {
        setSantriList(santriResponse);
      } else if (santriResponse.data && Array.isArray(santriResponse.data)) {
        setSantriList(santriResponse.data);
      } else if (santriResponse && Array.isArray(santriResponse)) {
        setSantriList(santriResponse);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error instanceof Error && error.message.includes("tidak ditemukan")) {
        setNotFound(true);
      }
      setError(error instanceof Error ? error.message : "Gagal memuat data");
    } finally {
      setFetching(false);
    }
  };

  // Helper function untuk mapping juz ke halaman
  const getJuzPageRanges = (juz: number): { start: number; end: number } => {
    const juzToPages: Record<number, { start: number; end: number }> = {
      1: { start: 1, end: 22 },
      2: { start: 23, end: 44 },
      3: { start: 45, end: 66 },
      4: { start: 67, end: 88 },
      5: { start: 89, end: 110 },
      6: { start: 111, end: 132 },
      7: { start: 133, end: 154 },
      8: { start: 155, end: 176 },
      9: { start: 177, end: 198 },
      10: { start: 199, end: 220 },
      11: { start: 221, end: 242 },
      12: { start: 243, end: 264 },
      13: { start: 265, end: 286 },
      14: { start: 287, end: 308 },
      15: { start: 309, end: 330 },
      16: { start: 331, end: 352 },
      17: { start: 353, end: 374 },
      18: { start: 375, end: 396 },
      19: { start: 397, end: 418 },
      20: { start: 419, end: 440 },
      21: { start: 441, end: 462 },
      22: { start: 463, end: 484 },
      23: { start: 485, end: 506 },
      24: { start: 507, end: 528 },
      25: { start: 529, end: 550 },
      26: { start: 551, end: 572 },
      27: { start: 573, end: 594 },
      28: { start: 595, end: 604 },
      29: { start: 605, end: 604 },
      30: { start: 605, end: 604 },
    };
    return juzToPages[juz] || { start: 1, end: 604 };
  };

  // Validasi halaman
  const validatePages = (): { isValid: boolean; message?: string } => {
    if (!formData.pageStart || !formData.pageEnd || !formData.juz) {
      return { isValid: true }; // Biarkan form validate yang lain
    }

    const pageStart = Number(formData.pageStart);
    const pageEnd = Number(formData.pageEnd);
    const juz = Number(formData.juz);
    const totalPages = pageEnd - pageStart + 1;

    // Validasi basic
    if (pageStart > pageEnd) {
      return {
        isValid: false,
        message: "Halaman mulai harus lebih kecil dari halaman akhir",
      };
    }

    if (pageStart < 1 || pageEnd > 604) {
      return {
        isValid: false,
        message: "Halaman harus dalam range 1-604",
      };
    }

    // Validasi berdasarkan juz
    const juzRange = getJuzPageRanges(juz);
    if (pageStart < juzRange.start || pageEnd > juzRange.end) {
      return {
        isValid: false,
        message: `Halaman harus dalam range Juz ${juz}: ${juzRange.start}-${juzRange.end}`,
      };
    }

    // Validasi 20 halaman maksimal (sama seperti create)
    if (totalPages > 20) {
      return {
        isValid: false,
        message: `Maksimal 20 halaman per pencatatan. Total: ${totalPages} halaman`,
      };
    }

    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (
        !formData.santriId ||
        !formData.juz ||
        !formData.pageStart ||
        !formData.pageEnd
      ) {
        throw new Error("Harap isi semua field yang wajib diisi");
      }

      const start = parseInt(formData.pageStart);
      const end = parseInt(formData.pageEnd);
      const totalPages = end - start + 1;

      // Validasi 20 halaman maksimal
      if (totalPages > 20) {
        throw new Error(
          `Maksimal 20 halaman per pencatatan. Total: ${totalPages} halaman`
        );
      }

      if (end < start) {
        throw new Error("Halaman akhir harus lebih besar dari halaman awal");
      }

      if (start < 1 || start > 604 || end < 1 || end > 604) {
        throw new Error("Halaman harus antara 1-604");
      }

      const payload = {
        santriId: parseInt(formData.santriId),
        juz: parseInt(formData.juz),
        pageStart: start,
        pageEnd: end,
        score: formData.score ? parseInt(formData.score) : undefined,
        remarks: formData.remarks || undefined,
        teacherId: formData.teacherId
          ? parseInt(formData.teacherId)
          : undefined,
      };

      const result = await tahfidzApi.update(id, payload);

      if (result.success) {
        setSuccess(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/tahfidz/${id}`);
        }, 2000);
      } else {
        throw new Error(result.error || "Gagal mengupdate catatan hafalan");
      }
    } catch (error) {
      console.error("Error updating tahfidz record:", error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
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

    // Validate numeric fields
    if (["juz", "pageStart", "pageEnd", "score"].includes(name)) {
      if (value && !/^\d*$/.test(value)) {
        return; // Only allow numbers
      }

      // Auto adjust pageEnd jika pageStart berubah
      if (name === "pageStart" && formData.pageEnd) {
        const newStart = value ? Number(value) : 1;
        const currentEnd = Number(formData.pageEnd);
        if (newStart > currentEnd) {
          setFormData((prev) => ({
            ...prev,
            [name]: value,
            pageEnd: value,
          }));
          return;
        }
      }

      // Auto adjust jika melebihi 20 halaman
      if (
        (name === "pageStart" || name === "pageEnd") &&
        formData.pageStart &&
        formData.pageEnd
      ) {
        const start =
          name === "pageStart" ? Number(value) : Number(formData.pageStart);
        const end =
          name === "pageEnd" ? Number(value) : Number(formData.pageEnd);
        const totalPages = end - start + 1;

        if (totalPages > 20) {
          // Auto adjust ke maksimal 20 halaman
          if (name === "pageEnd") {
            setFormData((prev) => ({
              ...prev,
              pageEnd: (start + 19).toString(),
            }));
            return;
          }
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate juz options (1-30)
  const juzOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  // Calculate total pages for display
  const totalPages =
    formData.pageStart && formData.pageEnd
      ? Number(formData.pageEnd) - Number(formData.pageStart) + 1
      : 0;

  const validation = validatePages();
  const isFormValid =
    formData.santriId &&
    formData.juz &&
    formData.pageStart &&
    formData.pageEnd &&
    validation.isValid &&
    totalPages > 0 &&
    totalPages <= 20;

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href="/tahfidz"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Data Tidak Ditemukan
            </h2>
            <p className="text-gray-600 mb-6">
              Catatan hafalan dengan ID {id} tidak ditemukan
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/tahfidz/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Detail
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Catatan Hafalan
            </h1>
            <p className="text-gray-600 mt-1">Update data hafalan santri</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Catatan hafalan berhasil diupdate!
              </p>
              <p className="text-sm text-green-600 mt-1">
                Mengalihkan ke halaman detail...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Gagal mengupdate data</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="space-y-6">
            {/* Santri Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Santri *
              </label>
              <select
                name="santriId"
                value={formData.santriId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <option value="">Pilih Santri</option>
                {santriList.map((santri) => (
                  <option key={santri.id} value={santri.id}>
                    {santri.name} (
                    {santri.gender === "Pria" ? "Laki-laki" : "Perempuan"})
                  </option>
                ))}
              </select>
            </div>

            {/* Juz Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4" />
                Juz *
              </label>
              <select
                name="juz"
                value={formData.juz}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <option value="">Pilih Juz</option>
                {juzOptions.map((juz) => (
                  <option key={juz} value={juz}>
                    Juz {juz}
                  </option>
                ))}
              </select>
              {formData.juz && (
                <p className="text-xs text-gray-500 mt-1">
                  Range halaman Juz {formData.juz}:{" "}
                  {getJuzPageRanges(Number(formData.juz)).start}-
                  {getJuzPageRanges(Number(formData.juz)).end}
                </p>
              )}
            </div>

            {/* Page Range */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Halaman *
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      totalPages > 20 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    Total: {totalPages} halaman
                  </span>
                  {totalPages > 20 && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    name="pageStart"
                    value={formData.pageStart}
                    onChange={handleChange}
                    min="1"
                    max="604"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Halaman Awal
                  </p>
                </div>

                <div>
                  <input
                    type="number"
                    name="pageEnd"
                    value={formData.pageEnd}
                    onChange={handleChange}
                    min={formData.pageStart || "1"}
                    max="604"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Halaman Akhir
                  </p>
                </div>
              </div>

              {/* Validation Messages */}
              {!validation.isValid && (
                <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded">
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validation.message}
                  </p>
                </div>
              )}

              {totalPages > 0 && totalPages <= 20 && validation.isValid && (
                <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded">
                  <p className="text-sm text-green-600">
                    ✓ Range halaman valid ({totalPages} halaman)
                  </p>
                  {totalPages > 15 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Mendekati batas maksimal 20 halaman
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Score */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Award className="w-4 h-4" />
                Nilai (Opsional)
              </label>
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleChange}
                placeholder="0-100"
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Skala 0-100 (kosongkan jika tidak ada nilai)
              </p>
            </div>

            {/* Remarks */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Catatan (Opsional)
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Masukkan catatan tentang hafalan..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Contoh: Tajwid bagus, kelancaran perlu ditingkatkan, atau
                murojaah
              </p>
            </div>
          </div>
        </div>

        {/* Info Panel untuk hafalan panjang */}
        {totalPages > 20 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">
                  Hafalan Panjang Terdeteksi
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Anda akan mencatat{" "}
                  <span className="font-bold">{totalPages} halaman</span>,
                  melebihi batas maksimal 20 halaman per pencatatan.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Silahkan ubah range halaman menjadi maksimal 20 halaman untuk
                  melanjutkan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <Link
            href={`/tahfidz/${id}`}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => loading && e.preventDefault()}
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Catatan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
