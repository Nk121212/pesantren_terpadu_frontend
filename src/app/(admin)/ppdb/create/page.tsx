"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ppdbApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function CreatePpdbPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birthDate: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await ppdbApi.createApplicant(formData);

      if (result.success) {
        alert("Pendaftaran berhasil dibuat!");
        router.push("/ppdb");
      } else {
        alert(result.error || "Gagal membuat pendaftaran");
      }
    } catch (error) {
      console.error("Create applicant error:", error);
      alert("Terjadi kesalahan saat membuat pendaftaran");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center gap-4">
        <Link
          href="/ppdb"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pendaftaran Santri Baru
          </h1>
          <p className="text-gray-600 mt-1">
            Isi data calon santri dengan lengkap
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nama Lengkap Calon Santri *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-2">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Jenis Kelamin *
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Tanggal Lahir */}
            <div className="space-y-2">
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700"
              >
                Tanggal Lahir
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@contoh.com"
              />
            </div>

            {/* Nama Wali */}
            <div className="space-y-2">
              <label
                htmlFor="guardianName"
                className="block text-sm font-medium text-gray-700"
              >
                Nama Wali
              </label>
              <input
                type="text"
                id="guardianName"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nama orang tua/wali"
              />
            </div>

            {/* Telepon Wali */}
            <div className="space-y-2">
              <label
                htmlFor="guardianPhone"
                className="block text-sm font-medium text-gray-700"
              >
                Telepon Wali
              </label>
              <input
                type="tel"
                id="guardianPhone"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="081234567890"
              />
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Alamat
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Alamat lengkap calon santri"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Link
              href="/ppdb"
              className="flex-1 md:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan Pendaftaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
