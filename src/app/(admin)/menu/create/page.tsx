"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { menuApi, type Menu } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Save, Menu as MenuIcon, Loader2 } from "lucide-react";

export default function CreateMenuPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parentMenus, setParentMenus] = useState<Menu[]>([]);
  const [parentMenusLoading, setParentMenusLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    icon: "",
    path: "",
    order: 0,
    parentId: "",
    isActive: true,
  });

  useEffect(() => {
    // Fetch parent menus for dropdown
    const fetchParentMenus = async () => {
      try {
        const response = await menuApi.getAll({ parentId: undefined });

        if (response.success && response.data) {
          setParentMenus(response.data);
        } else {
          setParentMenus([]);
        }
      } catch (error) {
        console.error("Failed to fetch parent menus:", error);
        setParentMenus([]);
      } finally {
        setParentMenusLoading(false);
      }
    };

    fetchParentMenus();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name === "order" ? Number(value) : value,
      }));
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate required fields
    if (!form.name) {
      alert("Nama menu wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: form.name,
        icon: form.icon || undefined,
        path: form.path || undefined,
        order: form.order,
        parentId: form.parentId ? Number(form.parentId) : undefined,
        isActive: form.isActive,
      };

      const response = await menuApi.create(submitData);

      if (response.success) {
        alert("Menu berhasil dibuat");
        router.push("/menu");
        router.refresh();
      } else {
        alert(response.error || "Gagal membuat menu");
      }
    } catch (error) {
      console.error("Create failed:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  // Contoh icon dari Lucide React untuk dropdown
  const iconOptions = [
    { value: "", label: "Pilih Icon" },
    { value: "Home", label: "Home" },
    { value: "Users", label: "Users" },
    { value: "DollarSign", label: "DollarSign" },
    { value: "PiggyBank", label: "PiggyBank" },
    { value: "FileText", label: "FileText" },
    { value: "CookingPot", label: "CookingPot" },
    { value: "History", label: "History" },
    { value: "GraduationCap", label: "GraduationCap" },
    { value: "ClipboardCheck", label: "ClipboardCheck" },
    { value: "Book", label: "Book" },
    { value: "Settings", label: "Settings" },
    { value: "Menu", label: "Menu" },
    { value: "Shield", label: "Shield" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {}
      <div className="flex items-center gap-4">
        <Link
          href="/menu"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MenuIcon className="w-6 h-6 text-green-600" />
            Tambah Menu Baru
          </h1>
          <p className="text-gray-600 mt-1">Isi data menu untuk sistem</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Menu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Menu *
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Masukkan nama menu"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <select
              name="icon"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              value={form.icon}
              onChange={handleChange}
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Pilih icon dari Lucide React
            </p>
          </div>

          {/* Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Path
            </label>
            <input
              type="text"
              name="path"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="/dashboard"
              value={form.path}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              Path URL untuk menu (contoh: /dashboard, /santri)
            </p>
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urutan
            </label>
            <input
              type="number"
              name="order"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="0"
              value={form.order}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              Angka untuk mengatur urutan tampilan menu (semakin kecil, semakin
              atas)
            </p>
          </div>

          {/* Parent Menu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Induk
            </label>
            <select
              name="parentId"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              value={form.parentId}
              onChange={handleChange}
              disabled={parentMenusLoading}
            >
              <option value="">Tidak ada (Menu Utama)</option>
              {parentMenus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name} {menu.path ? `(${menu.path})` : ""}
                </option>
              ))}
            </select>
            {parentMenusLoading && (
              <p className="text-sm text-gray-500 mt-1">Memuat data menu...</p>
            )}
            {parentMenus.length === 0 && !parentMenusLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Tidak ada menu utama tersedia
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="isActive" className="text-gray-700">
              <span className="font-medium">Aktif</span>
              <p className="text-sm text-gray-500 mt-1">
                Menu akan ditampilkan jika diaktifkan
              </p>
            </label>
          </div>

          {/* Buttons - Fixed position */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Link
              href="/menu"
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Menu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
