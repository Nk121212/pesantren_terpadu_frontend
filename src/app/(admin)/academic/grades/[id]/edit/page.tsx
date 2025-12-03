// src/app/(admin)/academic/grades/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { academicApi, santriApi, type AcademicGrade } from "@/lib/api";
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

interface UpdateGradeFormData {
  score: string;
  remarks: string;
}

export default function EditGradePage() {
  const params = useParams();
  const router = useRouter();
  const gradeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grade, setGrade] = useState<AcademicGrade | null>(null);
  const [formData, setFormData] = useState<UpdateGradeFormData>({
    score: "",
    remarks: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchGradeDetail();
  }, [gradeId]);

  const fetchGradeDetail = async () => {
    try {
      setLoading(true);
      const response = await academicApi.getGrade(Number(gradeId));

      let gradeData: AcademicGrade | null = null;

      if (response && typeof response === "object") {
        if ("data" in response && response.data) {
          gradeData = response.data;
        } else if ("id" in response) {
          gradeData = response as AcademicGrade;
        }
      }

      if (gradeData) {
        setGrade(gradeData);
        setFormData({
          score: gradeData.score.toString(),
          remarks: gradeData.remarks || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch grade detail:", error);
      alert("Gagal memuat data nilai");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.score) {
      newErrors.score = "Nilai harus diisi";
    } else {
      const score = parseFloat(formData.score);
      if (isNaN(score) || score < 0 || score > 100) {
        newErrors.score = "Nilai harus antara 0-100";
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

    setSaving(true);
    try {
      const payload = {
        score: parseFloat(formData.score),
        remarks: formData.remarks.trim() || undefined,
      };

      await academicApi.updateGrade(Number(gradeId), payload);

      alert("Nilai berhasil diperbarui!");
      router.push(`/academic/grades/${gradeId}`);
    } catch (error: any) {
      console.error("Failed to update grade:", error);
      alert(error.message || "Gagal memperbarui nilai");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!grade) {
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Nilai</h1>
            <p className="text-gray-600 mt-1">ID: {gradeId}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-medium">
              Data tidak ditemukan
            </p>
            <Link
              href="/academic/grades"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Kembali ke Daftar Nilai
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/academic/grades/${gradeId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            Edit Nilai
          </h1>
          <p className="text-gray-600 mt-1">
            Santri: {grade.santri?.name} • Mata Pelajaran: {grade.subject?.name}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Info Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Santri</p>
              <p className="font-medium">{grade.santri?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mata Pelajaran</p>
              <p className="font-medium">{grade.subject?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Semester/Tahun</p>
              <p className="font-medium">
                {grade.semester}/{grade.year}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nilai Sebelumnya</p>
              <p className="font-medium text-blue-600">
                {grade.score.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Score Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nilai Baru (0-100) *
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
                disabled={saving}
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
          </div>

          {/* Remarks Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Catatan perubahan nilai..."
              disabled={saving}
            />
            <p className="mt-2 text-sm text-gray-500">
              Jelaskan alasan perubahan nilai jika diperlukan.
            </p>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-3">
              Preview Perubahan
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Nilai Lama:</span>
                <p className="font-medium">{grade.score.toFixed(1)}</p>
              </div>
              <div>
                <span className="text-green-600">Nilai Baru:</span>
                <p className="font-medium">
                  {formData.score ? parseFloat(formData.score).toFixed(1) : "-"}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Perubahan:</span>
                <p className="font-medium">
                  {formData.score
                    ? `${(parseFloat(formData.score) - grade.score).toFixed(
                        1
                      )} poin`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Link
              href={`/academic/grades/${gradeId}`}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
