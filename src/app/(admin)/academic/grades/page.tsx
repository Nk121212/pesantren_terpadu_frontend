"use client";

import { useState, useEffect } from "react";
import { academicApi, type AcademicGrade } from "@/lib/api";
import Link from "next/link";
import {
  Award,
  Search,
  Filter,
  User,
  BookOpen,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function GradesPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("");

  // Placeholder data
  const [gradesData, setGradesData] = useState<AcademicGrade[]>([
    {
      id: 1,
      santriId: 1,
      subjectId: 1,
      score: 85.5,
      remarks: "Sangat baik",
      semester: 1,
      year: 2024,
      createdAt: "2024-01-15T08:00:00.000Z",
      santri: { id: 1, name: "Ahmad Fahmi" },
      subject: { id: 1, name: "Matematika" },
    },
    {
      id: 2,
      santriId: 2,
      subjectId: 1,
      score: 90.0,
      remarks: "Istimewa",
      semester: 1,
      year: 2024,
      createdAt: "2024-01-15T08:00:00.000Z",
      santri: { id: 2, name: "Siti Aminah" },
      subject: { id: 1, name: "Matematika" },
    },
  ]);

  const fetchGrades = async () => {
    try {
      setRefreshing(true);
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to fetch grades:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus nilai ini?")) return;

    try {
      // TODO: Implement delete API
      // await academicApi.deleteGrade(id);
      setGradesData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete grade:", error);
      alert("Gagal menghapus nilai");
    }
  };

  const filteredGrades = gradesData.filter((grade) => {
    const matchesSearch =
      search === "" ||
      grade.santri?.name?.toLowerCase().includes(search.toLowerCase()) ||
      grade.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
      grade.remarks?.toLowerCase().includes(search.toLowerCase());

    const matchesSemester =
      semesterFilter === "all" || grade.semester.toString() === semesterFilter;

    const matchesYear = !yearFilter || grade.year.toString() === yearFilter;

    return matchesSearch && matchesSemester && matchesYear;
  });

  const stats = {
    total: gradesData.length,
    average:
      gradesData.length > 0
        ? gradesData.reduce((acc, grade) => acc + grade.score, 0) /
          gradesData.length
        : 0,
    highest:
      gradesData.length > 0 ? Math.max(...gradesData.map((g) => g.score)) : 0,
    lowest:
      gradesData.length > 0 ? Math.min(...gradesData.map((g) => g.score)) : 0,
  };

  if (loading && gradesData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-blue-600" />
            Nilai & Rapor
          </h1>
          <p className="text-gray-600 mt-1">Kelola nilai akademik santri</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchGrades}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <Link
            href="/academic/grades/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Input Nilai
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Nilai</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">Rekor nilai</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.average.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Skor</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tertinggi</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.highest.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Skor</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terendah</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.lowest.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Skor</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari santri, mata pelajaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">Semua Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun Ajaran
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Semua Tahun</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Santri
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mata Pelajaran
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nilai
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Semester/Tahun
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGrades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {grade.santri?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {grade.santriId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {grade.subject?.name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        grade.score >= 85
                          ? "bg-green-100 text-green-800"
                          : grade.score >= 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {grade.score.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">
                      {grade.semester}/{grade.year}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs">
                      {grade.remarks || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(grade.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGrades.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada data nilai</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || semesterFilter !== "all" || yearFilter
                ? "Coba ubah filter pencarian"
                : "Mulai dengan menginput nilai santri"}
            </p>
            <Link
              href="/academic/grades/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mt-4"
            >
              <Plus className="w-4 h-4" />
              Input Nilai Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
