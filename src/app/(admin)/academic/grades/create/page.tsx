"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Award,
  User,
  BookOpen,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";
import { academicApi, santriApi, teachersApi } from "@/lib/api";
import type { Santri, AcademicSubject, CreateGradeDto } from "@/lib/api";

export default function CreateGradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [santris, setSantris] = useState<Santri[]>([]);
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [formData, setFormData] = useState({
    santriId: "",
    subjectId: "",
    score: "",
    remarks: "",
    semester: "1",
    year: new Date().getFullYear().toString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);

      // Fetch santris
      const santriResponse = await santriApi.list({ per_page: 100 });
      const santrisData = Array.isArray(santriResponse)
        ? santriResponse
        : "data" in santriResponse
        ? santriResponse.data
        : [];
      setSantris(santrisData as Santri[]);

      // Fetch subjects
      const subjectsResponse = await academicApi.listSubjects();
      const subjectsData = Array.isArray(subjectsResponse)
        ? subjectsResponse
        : "data" in subjectsResponse
        ? subjectsResponse.data
        : [];
      setSubjects(subjectsData as AcademicSubject[]);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      alert("Gagal memuat data santri dan mata pelajaran");
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.santriId) {
      newErrors.santriId = "Pilih santri";
    }

    if (!formData.subjectId) {
      newErrors.subjectId = "Pilih mata pelajaran";
    }

    if (!formData.score) {
      newErrors.score = "Nilai harus diisi";
    } else {
      const score = parseFloat(formData.score);
      if (isNaN(score) || score < 0 || score > 100) {
        newErrors.score = "Nilai harus antara 0-100";
      }
    }

    if (!formData.semester) {
      newErrors.semester = "Pilih semester";
    }

    if (!formData.year) {
      newErrors.year = "Tahun harus diisi";
    } else {
      const year = parseInt(formData.year);
      if (isNaN(year) || year < 2000 || year > 2100) {
        newErrors.year = "Tahun harus valid";
      }
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
      const payload: CreateGradeDto = {
        santriId: parseInt(formData.santriId),
        subjectId: parseInt(formData.subjectId),
        score: parseFloat(formData.score),
        remarks: formData.remarks.trim() || undefined,
        semester: parseInt(formData.semester),
        year: parseInt(formData.year),
      };

      const response = await academicApi.createGrade(payload);

      // Log audit trail
      try {
        const auditData = {
          module: "GRADE",
          action: "CREATE",
          recordId: response.id,
          note: `Input nilai ${formData.score} untuk santri ID: ${formData.santriId}`,
        };
      } catch (auditError) {
        console.error("Failed to create audit log:", auditError);
      }

      alert("Nilai berhasil disimpan!");
      router.push("/academic/grades");
    } catch (error: unknown) {
      console.error("Failed to create grade:", error);

      let errorMessage = "Gagal menyimpan nilai";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String((error as { message: string }).message);
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/academic/grades"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            Input Nilai
          </h1>
          <p className="text-gray-600 mt-1">Masukkan nilai akademik santri</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {loadingData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Santri Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Santri *
                </div>
              </label>
              <select
                value={formData.santriId}
                onChange={(e) => handleInputChange("santriId", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                  errors.santriId ? "border-red-300" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Pilih Santri</option>
                {santris.map((santri) => (
                  <option key={santri.id} value={santri.id}>
                    {santri.name} (ID: {santri.id})
                  </option>
                ))}
              </select>
              {errors.santriId && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.santriId}
                </p>
              )}
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Mata Pelajaran *
                </div>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => handleInputChange("subjectId", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                  errors.subjectId ? "border-red-300" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Pilih Mata Pelajaran</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                    {subject.teacher && ` - ${subject.teacher.name}`}
                  </option>
                ))}
              </select>
              {errors.subjectId && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.subjectId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai (0-100) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.score}
                    onChange={(e) => handleInputChange("score", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.score ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Contoh: 85.5"
                    disabled={loading}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    /100
                  </span>
                </div>
                {errors.score && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.score}
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  {[85, 70, 55].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() =>
                        handleInputChange("score", score.toString())
                      }
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                    >
                      {score}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester *
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) =>
                    handleInputChange("semester", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                    errors.semester ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
                {errors.semester && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.semester}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Tahun Ajaran *
                  </div>
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                    errors.year ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}/{year + 1}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.year}
                  </p>
                )}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Keterangan
                </div>
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Catatan khusus, misal: 'Sangat baik dalam pemahaman konsep'"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Opsional. Gunakan untuk mencatat informasi tambahan.
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3">Preview Nilai</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Santri:</span>
                  <p className="font-medium">
                    {formData.santriId
                      ? santris.find(
                          (s) => s.id === parseInt(formData.santriId)
                        )?.name || "-"
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Mata Pelajaran:</span>
                  <p className="font-medium">
                    {formData.subjectId
                      ? subjects.find(
                          (s) => s.id === parseInt(formData.subjectId)
                        )?.name || "-"
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Nilai:</span>
                  <p
                    className={`font-medium ${
                      formData.score
                        ? parseFloat(formData.score) >= 85
                          ? "text-green-600"
                          : parseFloat(formData.score) >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                        : ""
                    }`}
                  >
                    {formData.score || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Semester/Tahun:</span>
                  <p className="font-medium">
                    {formData.semester}/{formData.year || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Link
                href="/academic/grades"
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Menyimpan..." : "Simpan Nilai"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Tips Input Nilai
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pastikan data santri dan mata pelajaran sudah benar</li>
          <li>• Nilai dapat berupa desimal (misal: 85.5)</li>
          <li>• Sistem akan mencatat waktu input secara otomatis</li>
          <li>• Data nilai dapat diedit atau dihapus nanti</li>
        </ul>
      </div>
    </div>
  );
}
