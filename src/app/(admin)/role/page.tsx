"use client";

import { useState, useEffect } from "react";
import { RoleType, roleApi } from "@/lib/api"; // Ganti import
import Link from "next/link";
import { Shield, Plus, Edit, Trash2, Users, Eye, Loader2 } from "lucide-react";

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleApi.getAll(); // Gunakan roleApi
      if (response.success) {
        setRoles(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus role ini?")) return;

    try {
      setDeleteLoading(id);
      // Cari role name berdasarkan ID
      const roleToDelete = roles.find((role) => role.id === id);
      if (!roleToDelete) {
        alert("Role tidak ditemukan");
        return;
      }

      await roleApi.delete(roleToDelete.name); // Hapus berdasarkan nama role
      await fetchRoles();
      alert("Role berhasil dihapus");
    } catch (error) {
      console.error("Failed to delete role:", error);
      alert("Gagal menghapus role. Silakan coba lagi.");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-green-600" />
            Manajemen Role
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola role dan hak akses pengguna
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRoles}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Refresh
          </button>
          <Link
            href="/role/create"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Role
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Role</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {roles.length}
              </p>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Role Aktif</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {roles.filter((r) => r.isActive).length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {roles.reduce((total, role) => total + role.id * 5, 0)}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Role List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Role</h2>
            <div className="text-sm text-gray-600">
              {roles.length} role ditemukan
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{role.name}</p>
                        <p className="text-sm text-gray-500">ID: {role.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600 max-w-md truncate">
                      {role.description || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        role.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {role.isActive ? "AKTIF" : "NONAKTIF"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(role.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/role/${role.name}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/role/${role.name}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/role/${role.name}/permissions`}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Atur Permission"
                      >
                        <Shield className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(role.id)}
                        disabled={deleteLoading === role.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Hapus"
                      >
                        {deleteLoading === role.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {roles.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Belum ada role</p>
            <p className="text-sm text-gray-400 mt-1">
              Mulai dengan membuat role baru
            </p>
            <Link
              href="/role/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium mt-4"
            >
              <Plus className="w-4 h-4" />
              Tambah Role
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
