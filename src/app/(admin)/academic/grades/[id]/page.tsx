// src/app/(admin)/academic/grades/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { academicApi, type AcademicGrade } from "@/lib/api";
import {
  ArrowLeft,
  Award,
  User,
  BookOpen,
  Calendar,
  FileText,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  TrendingUp,
  BarChart,
} from "lucide-react";

export default function GradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gradeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState<AcademicGrade | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGradeDetail();
  }, [gradeId]);

  const fetchGradeDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await academicApi.getGrade(Number(gradeId));

      // Handle response format
      let gradeData: AcademicGrade | null = null;

      if (response && typeof response === "object") {
        if ("data" in response && response.data) {
          gradeData = response.data;
        } else if ("id" in response) {
          gradeData = response as AcademicGrade;
        }
      }

      if (!gradeData) {
        throw new Error("Data grade tidak ditemukan");
      }

      setGrade(gradeData);
    } catch (error: any) {
      console.error("Failed to fetch grade detail:", error);
      setError(error.message || "Gagal memuat detail nilai");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus nilai ini?")) return;

    try {
      await academicApi.deleteGrade(Number(gradeId));
      alert("Nilai berhasil dihapus");
      router.push("/academic/grades");
    } catch (error: any) {
      console.error("Failed to delete grade:", error);
      alert(error.message || "Gagal menghapus nilai");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Sangat Baik";
    if (score >= 70) return "Baik";
    if (score >= 55) return "Cukup";
    return "Perlu Perbaikan";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !grade) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/academic/grades"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Nilai</h1>
            <p className="text-gray-600 mt-1">ID: {gradeId}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-medium">
              {error || "Data tidak ditemukan"}
            </p>
            <p className="text-gray-500 mt-2">
              Nilai dengan ID {gradeId} tidak ditemukan atau telah dihapus.
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
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
              Detail Nilai
            </h1>
            <p className="text-gray-600 mt-1">
              ID: {grade.id} • Input:{" "}
              {grade.createdAt
                ? new Date(grade.createdAt).toLocaleDateString("id-ID")
                : "-"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/academic/grades/${grade.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Nilai</h2>
                <p className="text-sm text-gray-500">Hasil evaluasi belajar</p>
              </div>
              <div
                className={`px-4 py-2 rounded-lg ${getScoreColor(
                  grade.score
                )} font-bold`}
              >
                {grade.score.toFixed(1)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Kategori</span>
                <span className="font-medium">
                  {getScoreLabel(grade.score)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Semester</span>
                <span className="font-medium">Semester {grade.semester}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tahun Ajaran</span>
                <span className="font-medium">
                  {grade.year}/{grade.year + 1}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Skor: {grade.score.toFixed(1)}/100
                </span>
                <span className="text-sm text-gray-600">Target: 75.0</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    grade.score >= 75 ? "bg-green-500" : "bg-yellow-500"
                  }`}
                  style={{ width: `${Math.min(grade.score, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {grade.remarks && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Keterangan
                </h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {grade.remarks}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Teknis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Dibuat</p>
                  <p className="font-medium">
                    {grade.createdAt
                      ? new Date(grade.createdAt).toLocaleString("id-ID")
                      : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Diperbarui</p>
                  <p className="font-medium">
                    {grade.updatedAt
                      ? new Date(grade.updatedAt).toLocaleString("id-ID")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Santri</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-medium">{grade.santri?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID Santri</p>
                <p className="font-medium">{grade.santriId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  Aktif
                </span>
              </div>
            </div>
            <Link
              href={`/santri/${grade.santriId}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mt-4"
            >
              Lihat profil santri →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Mata Pelajaran
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-medium">
                  {grade.subject?.name || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID Pelajaran</p>
                <p className="font-medium">{grade.subjectId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  Akademik
                </span>
              </div>
            </div>
            <Link
              href={`/academic/subjects/${grade.subjectId}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mt-4"
            >
              Lihat detail pelajaran →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Aksi Cepat
            </h2>
            <div className="space-y-3">
              <Link
                href={`/academic/grades/${grade.id}/edit`}
                className="flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Edit className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Edit Nilai</span>
                </div>
                <span className="text-sm text-gray-500">→</span>
              </Link>
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-between p-3 border border-red-300 rounded-lg hover:bg-red-50 transition text-red-600"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Hapus Nilai</span>
                </div>
                <span className="text-sm">→</span>
              </button>
              <Link
                href="/academic/grades/create"
                className="flex items-center justify-between p-3 border border-blue-300 rounded-lg hover:bg-blue-50 transition text-blue-600"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4" />
                  <span className="font-medium">Input Nilai Baru</span>
                </div>
                <span className="text-sm">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Data nilai terakhir diperbarui:{" "}
          {grade.updatedAt
            ? new Date(grade.updatedAt).toLocaleString("id-ID")
            : "-"}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/academic/grades"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Kembali ke Daftar
          </Link>
          <Link
            href="/academic/grades/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Input Nilai Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
