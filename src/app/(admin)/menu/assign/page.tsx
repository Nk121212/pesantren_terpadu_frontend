"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { menuApi } from "@/lib/api";
import type { Menu } from "@/lib/api"; // ✅ FIX UTAMA

import { ArrowLeft, Save, Shield, Loader2 } from "lucide-react";

type PermissionKey =
  | "canView"
  | "canCreate"
  | "canEdit"
  | "canDelete"
  | "canExport";

interface FlatMenu extends Menu {
  level: number;
  displayName: string;
}

/* =======================
   CONSTANTS
======================= */

const PREDEFINED_ROLES = [
  {
    value: "SUPERADMIN",
    label: "Super Admin",
    description: "Akses penuh ke semua fitur",
  },
  {
    value: "ADMIN",
    label: "Administrator",
    description: "Akses administrasi dan pengaturan",
  },
  {
    value: "TEACHER",
    label: "Guru",
    description: "Akses untuk akademik dan absensi",
  },
  {
    value: "TREASURER",
    label: "Bendahara",
    description: "Akses untuk keuangan dan tagihan",
  },
  {
    value: "COUNSELOR",
    label: "Konselor",
    description: "Akses untuk konseling",
  },
  {
    value: "PARENT",
    label: "Wali Santri",
    description: "Akses terbatas untuk melihat data santri",
  },
];

/* =======================
   PAGE
======================= */

export default function AssignMenuPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [formData, setFormData] = useState({
    role: "",
    menuId: "",
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  /* =======================
     FETCH MENUS
  ======================= */

  const fetchMenus = async () => {
    try {
      const response = await menuApi.getAll();
      if (response.success && response.data) {
        setMenus(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch menus:", error);
    }
  };

  /* =======================
     SUBMIT
  ======================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await menuApi.assignMenuToRole({
        role: formData.role,
        menuId: Number(formData.menuId),
        canView: formData.canView,
        canCreate: formData.canCreate,
        canEdit: formData.canEdit,
        canDelete: formData.canDelete,
        canExport: formData.canExport,
      });

      if (response.success) {
        alert("Menu berhasil ditetapkan ke role");
        router.push("/menu");
      } else {
        alert(response.error || "Gagal menetapkan menu ke role");
      }
    } catch (error) {
      console.error("Failed to assign menu:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     FORM CHANGE
  ======================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  /* =======================
     FLATTEN MENU TREE
  ======================= */

  const getFlatMenus = (menuList: Menu[], level = 0): FlatMenu[] => {
    let result: FlatMenu[] = [];

    menuList.forEach((menu) => {
      result.push({
        ...menu,
        level,
        displayName: `${"─ ".repeat(level)}${menu.name}`,
      });

      if (menu.children && menu.children.length > 0) {
        result = result.concat(getFlatMenus(menu.children, level + 1));
      }
    });

    return result;
  };

  const flatMenus = getFlatMenus(menus);

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/menu"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-green-600" />
            Tetapkan Menu ke Role
          </h1>
          <p className="text-gray-600 mt-1">
            Atur hak akses menu untuk setiap role
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Pilih Role</option>
                {PREDEFINED_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Menu */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Menu *
              </label>
              <select
                name="menuId"
                value={formData.menuId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Pilih Menu</option>
                {flatMenus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.displayName} {menu.path && `(${menu.path})`}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-gray-500">
                Total {flatMenus.length} menu tersedia
              </div>
            </div>

            {/* Permissions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Hak Akses
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(
                  [
                    ["canView", "Lihat", "Akses melihat data"],
                    ["canCreate", "Buat", "Akses membuat data baru"],
                    ["canEdit", "Edit", "Akses mengubah data"],
                    ["canDelete", "Hapus", "Akses menghapus data"],
                    ["canExport", "Export", "Akses mengekspor data"],
                  ] as [PermissionKey, string, string][]
                ).map(([key, title, desc]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-3 border rounded-lg"
                  >
                    <input
                      type="checkbox"
                      name={key}
                      checked={formData[key]}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-600"
                    />
                    <div>
                      <div className="font-medium">{title}</div>
                      <div className="text-sm text-gray-500">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/menu" className="px-4 py-2 border rounded-lg">
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan Penetapan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
