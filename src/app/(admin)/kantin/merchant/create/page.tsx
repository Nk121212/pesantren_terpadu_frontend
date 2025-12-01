"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { canteenApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Store, Plus } from "lucide-react";

export default function CreateMerchantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await canteenApi.createMerchant({
        userId: parseInt(formData.userId),
        name: formData.name,
      });

      if (result.success) {
        alert("Merchant berhasil dibuat!");
        router.push("/kantin");
      } else {
        alert(`Gagal membuat merchant: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating merchant:", error);
      alert("Terjadi kesalahan saat membuat merchant");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/kantin"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-7 h-7 text-blue-600" />
            Tambah Merchant Baru
          </h1>
          <p className="text-gray-600 mt-1">
            Daftarkan merchant baru untuk sistem kantin cashless
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Informasi Merchant
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Isi data merchant dengan lengkap dan benar
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="number"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="Masukkan ID user yang akan menjadi merchant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                ID user yang sudah terdaftar di sistem
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Merchant
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama merchant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Link
                href="/kantin"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Membuat...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Buat Merchant
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
