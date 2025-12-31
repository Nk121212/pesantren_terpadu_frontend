"use client";

import { useState, useEffect } from "react";
import { academicApi, type AcademicSubject } from "@/lib/api";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Users,
  Filter,
  ChevronRight,
  RefreshCw,
  Eye,
} from "lucide-react";

export default function SubjectsListPage() {
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchSubjects = async () => {
    try {
      setRefreshing(true);
      const response = await academicApi.listSubjects({ skip: 0, take: 100 });

      let data: AcademicSubject[] = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response
      ) {
        data = Array.isArray(response.data) ? response.data : [];
      }

      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus mata pelajaran "${name}"?`)) return;

    try {
      await academicApi.deleteSubject(id);
      fetchSubjects();
    } catch (error) {
      console.error("Failed to delete subject:", error);
      alert("Gagal menghapus mata pelajaran");
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(search.toLowerCase()) ||
      subject.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && subjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-purple-600" />
            Mata Pelajaran
          </h1>
          <p className="text-gray-600 mt-1">Kelola mata pelajaran pesantren</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubjects}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <Link
            href="/academic/subjects/create"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Mata Pelajaran
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari mata pelajaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none">
                  <option value="">Semua Pengajar</option>
                  <option value="1">Ustadz Ahmad</option>
                  <option value="2">Ustadzah Fatimah</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Mata Pelajaran
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subjects.length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Dengan Pengajar
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subjects.filter((s) => s.teacherId).length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subjects.length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Mata Pelajaran
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pengajar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {subject.name}
                      </p>
                      <p className="text-sm text-gray-500">ID: {subject.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                      {subject.description || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {subject.teacher ? (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {subject.teacher.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Belum ada</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(subject.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/academic/subjects/${subject.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/academic/subjects/${subject.id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(subject.id, subject.name)}
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

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada mata pelajaran</p>
            {search && (
              <p className="text-gray-400 mt-2">
                Tidak ditemukan mata pelajaran dengan kata kunci {search}
              </p>
            )}
            <Link
              href="/academic/subjects/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium mt-4"
            >
              <Plus className="w-4 h-4" />
              Tambah Mata Pelajaran Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
