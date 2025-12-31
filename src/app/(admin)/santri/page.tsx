// src/app/(admin)/santri/page.tsx
"use client";

import { useEffect, useState } from "react";
import { santriApi, type Santri, type Paginated } from "@/lib/api";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, Users } from "lucide-react";

export default function SantriListPage() {
  const [data, setData] = useState<Paginated<Santri> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await santriApi.list({ page: 1, per_page: 20 });
        console.log("Fetched santri data:", result);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch santri:", error);
        // Set empty data on error
        setData({
          data: [],
          meta: {
            total: 0,
            per_page: 0,
            current_page: 1,
            last_page: 1,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSantri = data?.data?.filter((santri) =>
    santri.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ... sisa kode tetap sama ... */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Daftar Santri
          </h1>
          <p className="text-gray-600 mt-1">Kelola data santri pesantren</p>
        </div>

        <Link
          href="/santri/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-4 h-4" />
          Tambah Santri
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Santri</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.meta?.total || 0}
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
              <p className="text-sm font-medium text-gray-600">Santri Pria</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.data?.filter((s) => s.gender === "L").length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Santri Wanita</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.data?.filter((s) => s.gender === "P").length || 0}
              </p>
            </div>
            <div className="p-3 bg-pink-50 rounded-full">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Santri
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal Lahir
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSantri?.map((santri) => (
                <tr key={santri.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{santri.name}</p>
                      <p className="text-sm text-gray-500">ID: {santri.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        santri.gender === "Pria"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-pink-100 text-pink-800"
                      }`}
                    >
                      {santri.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {santri.birthDate
                      ? new Date(santri.birthDate).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/santri/${santri.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/santri/${santri.id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={async () => {
                          if (confirm(`Hapus santri ${santri.name}?`)) {
                            const result = await santriApi.remove(santri.id);
                            if (result.success) {
                              // Refresh data
                              const newData = await santriApi.list({
                                page: 1,
                                per_page: 20,
                              });
                              setData(newData);
                            }
                          }
                        }}
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

        {(!filteredSantri || filteredSantri.length === 0) && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada data santri</p>
            {search && (
              <p className="text-gray-400 mt-2">
                Tidak ditemukan santri dengan nama {search}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
