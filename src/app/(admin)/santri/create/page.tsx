"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { santriApi, type Guardian, type SantriFormData } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import Link from "next/link";

export default function CreateSantriPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [guardiansLoading, setGuardiansLoading] = useState(true);

  const [form, setForm] = useState<SantriFormData>({
    name: "",
    gender: "",
    birthDate: "",
    address: "",
    guardianId: "",
  });

  useEffect(() => {
    // Fetch list of guardians for dropdown
    const fetchGuardians = async () => {
      try {
        const response = await santriApi.getGuardians();

        // Handle different response formats
        if (Array.isArray(response)) {
          setGuardians(response);
        } else if (
          response &&
          typeof response === "object" &&
          "data" in response
        ) {
          setGuardians(Array.isArray(response.data) ? response.data : []);
        } else {
          setGuardians([]);
        }
      } catch (error) {
        console.error("Failed to fetch guardians:", error);
        setGuardians([]);
      } finally {
        setGuardiansLoading(false);
      }
    };

    fetchGuardians();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate required fields
    if (!form.name || !form.gender || !form.birthDate || !form.address) {
      alert("Harap lengkapi semua field yang wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: form.name,
        gender: form.gender,
        birthDate: form.birthDate,
        address: form.address,
        guardianId: form.guardianId ? Number(form.guardianId) : undefined,
      };

      await santriApi.create(submitData);
      router.push("/santri");
      router.refresh(); // Refresh the page to show new data
    } catch (error) {
      console.error("Create failed:", error);
      alert("Gagal menambah santri. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {}
      <div className="flex items-center gap-4">
        <Link
          href="/santri"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Tambah Santri Baru
          </h1>
          <p className="text-gray-600 mt-1">
            Isi data santri yang akan didaftarkan
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Masukkan nama lengkap santri"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kelamin *
            </label>
            <select
              name="gender"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="L">Laki - Laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Lahir *
            </label>
            <input
              type="date"
              name="birthDate"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={form.birthDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat *
            </label>
            <textarea
              name="address"
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Masukkan alamat lengkap santri"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wali Santri
            </label>
            <select
              name="guardianId"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={form.guardianId}
              onChange={handleChange}
              disabled={guardiansLoading}
            >
              <option value="">Pilih Wali Santri</option>
              {guardians.map((guardian) => (
                <option key={guardian.id} value={guardian.id}>
                  {guardian.name} {guardian.phone ? `(${guardian.phone})` : ""}
                </option>
              ))}
            </select>
            {guardiansLoading && (
              <p className="text-sm text-gray-500 mt-1">Memuat data wali...</p>
            )}
            {guardians.length === 0 && !guardiansLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Tidak ada data wali tersedia
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/santri"
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan Santri"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
