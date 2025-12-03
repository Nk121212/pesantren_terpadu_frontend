"use client";

import { useState, useEffect } from "react";
import { academicApi, type AcademicGrade, type Paginated } from "@/lib/api";
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
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
} from "lucide-react";

interface GradesResponse {
  success: boolean;
  data: AcademicGrade[];
  meta: {
    total: number;
    skip: number;
    take: number;
    hasMore: boolean;
  };
}

export default function GradesPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [santriFilter, setSantriFilter] = useState("");

  // State untuk data grades
  const [gradesData, setGradesData] = useState<AcademicGrade[]>([]);
  const [pagination, setPagination] = useState({
    skip: 0,
    take: 10,
    total: 0,
    hasMore: false,
  });
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [santris, setSantris] = useState<{ id: number; name: string }[]>([]);

  // Fetch initial data
  useEffect(() => {
    fetchGrades();
    fetchSubjects();
    fetchSantris();
  }, []);

  // Fetch grades dengan filter
  const fetchGrades = async (resetPagination = false) => {
    try {
      if (resetPagination) {
        setPagination((prev) => ({ ...prev, skip: 0 }));
      }

      setRefreshing(true);

      const params: Record<string, string | number> = {
        skip: resetPagination ? 0 : pagination.skip,
        take: pagination.take,
      };

      // Tambahkan filter jika ada
      if (santriFilter) params.santriId = santriFilter;
      if (subjectFilter) params.subjectId = subjectFilter;
      if (semesterFilter !== "all") params.semester = semesterFilter;
      if (yearFilter) params.year = yearFilter;

      const response = await academicApi.listGrades(params);
      //   console.log(response);
      const responseNew = response.data;
      console.log(responseNew);

      // Handle response format
      let grades: AcademicGrade[] = [];
      let total = 0;

      if (Array.isArray(responseNew)) {
        grades = responseNew;
        total = responseNew.length;
      } else if (responseNew && typeof responseNew === "object") {
        if ("data" in responseNew && Array.isArray(responseNew.data)) {
          grades = responseNew.data;
        }
        if (
          "meta" in responseNew &&
          responseNew.meta &&
          "total" in responseNew.meta
        ) {
          total = responseNew.meta.total as number;
        }
      }

      setGradesData(grades);
      setPagination((prev) => ({
        ...prev,
        total,
        hasMore: (resetPagination ? 0 : prev.skip) + prev.take < total,
      }));
    } catch (error) {
      console.error("Failed to fetch grades:", error);
      alert("Gagal mengambil data nilai");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch subjects untuk filter
  const fetchSubjects = async () => {
    try {
      const response = await academicApi.listSubjects();
      let subjectsData: { id: number; name: string }[] = [];

      if (Array.isArray(response)) {
        subjectsData = response.map((subj) => ({
          id: subj.id,
          name: subj.name,
        }));
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        Array.isArray(response.data)
      ) {
        subjectsData = response.data.map((subj: any) => ({
          id: subj.id,
          name: subj.name,
        }));
      }

      setSubjects(subjectsData);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  // Fetch santris untuk filter
  const fetchSantris = async () => {
    try {
      // Anda perlu menyesuaikan dengan API yang ada
      // Contoh menggunakan santriApi jika ada
      const response = await import("@/lib/api").then((api) =>
        api.santriApi.list({ per_page: 100 })
      );

      let santrisData: { id: number; name: string }[] = [];

      if (Array.isArray(response)) {
        santrisData = response.map((s) => ({ id: s.id, name: s.name }));
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        Array.isArray(response.data)
      ) {
        santrisData = response.data.map((s: any) => ({
          id: s.id,
          name: s.name,
        }));
      }

      setSantris(santrisData);
    } catch (error) {
      console.error("Failed to fetch santris:", error);
    }
  };

  // Handle delete grade
  const handleDelete = async (id: number) => {
    if (!confirm("Hapus nilai ini?")) return;

    try {
      await academicApi.deleteGrade(id);
      alert("Nilai berhasil dihapus");
      fetchGrades(true); // Refresh dengan reset pagination
    } catch (error: any) {
      console.error("Failed to delete grade:", error);
      alert(error.message || "Gagal menghapus nilai");
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination((prev) => ({
        ...prev,
        skip: prev.skip + prev.take,
      }));
      fetchGrades();
    }
  };

  const handlePrevPage = () => {
    if (pagination.skip > 0) {
      setPagination((prev) => ({
        ...prev,
        skip: Math.max(0, prev.skip - prev.take),
      }));
      fetchGrades();
    }
  };

  // Filter local (jika masih mau pakai client-side filtering)
  const filteredGrades = gradesData.filter((grade) => {
    console.log("filteredGrades " + grade);
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

  // Calculate stats
  const stats = {
    total: pagination.total,
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

  // Apply filters (trigger API call)
  const applyFilters = () => {
    fetchGrades(true);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setSemesterFilter("all");
    setYearFilter("");
    setSubjectFilter("");
    setSantriFilter("");
    fetchGrades(true);
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
          <p className="text-gray-600 mt-1">
            {pagination.total} data nilai ditemukan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchGrades(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <Filter className="w-4 h-4" />
            Reset Filter
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
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
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

          {/* Santri Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Santri
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={santriFilter}
                onChange={(e) => setSantriFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Semua Santri</option>
                {santris.map((santri) => (
                  <option key={santri.id} value={santri.id}>
                    {santri.name} (ID: {santri.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mata Pelajaran
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Semua Pelajaran</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Semester Filter */}
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
        </div>

        {/* Row 2 Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Year Filter */}
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
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
          </div>

          {/* Items Per Page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data per Halaman
            </label>
            <select
              value={pagination.take}
              onChange={(e) => {
                setPagination((prev) => ({
                  ...prev,
                  take: Number(e.target.value),
                  skip: 0,
                }));
                fetchGrades(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          {/* Apply Filters Button */}
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">
              Menampilkan {Math.min(pagination.skip + 1, pagination.total)}-
              {Math.min(pagination.skip + pagination.take, pagination.total)}{" "}
              dari {pagination.total} data
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

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
                  Tanggal Input
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
                    <span className="text-sm text-gray-600">
                      {grade.createdAt
                        ? new Date(grade.createdAt).toLocaleDateString("id-ID")
                        : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate">
                      {grade.remarks || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/academic/grades/${grade.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/academic/grades/${grade.id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
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

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">
              Halaman {Math.floor(pagination.skip / pagination.take) + 1} dari{" "}
              {Math.ceil(pagination.total / pagination.take)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={pagination.skip === 0}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>
            <button
              onClick={handleNextPage}
              disabled={!pagination.hasMore}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredGrades.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada data nilai</p>
            <p className="text-sm text-gray-400 mt-1">
              {search ||
              semesterFilter !== "all" ||
              yearFilter ||
              subjectFilter ||
              santriFilter
                ? "Coba ubah filter pencarian"
                : "Mulai dengan menginput nilai santri"}
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Reset Filter
              </button>
              <Link
                href="/academic/grades/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Input Nilai Pertama
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
