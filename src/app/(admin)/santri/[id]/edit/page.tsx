"use client";

import { useEffect, useState } from "react";
import { santriApi, type Santri, type Guardian } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Edit2 } from "lucide-react";

export default function EditSantriPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [guardiansLoading, setGuardiansLoading] = useState(true);
  const [form, setForm] = useState<Partial<Santri>>({});
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch santri data
        const santriResponse = await santriApi.get(Number(id));
        setForm(santriResponse.data);

        // Fetch guardians list
        const guardiansResponse = (await santriApi.getGuardians?.()) || {
          data: [],
        };
        setGuardians(guardiansResponse.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setInitialLoading(false);
        setGuardiansLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...form,
        guardianId: form.guardianId
          ? parseInt(form.guardianId as any)
          : undefined,
      };
      await santriApi.update(Number(id), submitData);
      router.push("/santri");
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate santri");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/santri/${id}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Edit2 className="w-6 h-6 text-green-600" />
            Edit Data Santri
          </h1>
          <p className="text-gray-600 mt-1">Update informasi data santri</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg">
          <User className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-blue-600 font-medium">Sedang mengedit</p>
            <p className="text-blue-800">
              {form.name} (ID: {id})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap *
            </label>
            <input
              name="name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Masukkan nama lengkap santri"
              value={form.name || ""}
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
              value={form.gender || ""}
              onChange={handleChange}
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Pria">Pria</option>
              <option value="Wanita">Wanita</option>
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
              value={form.birthDate || ""}
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
              value={form.address || ""}
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
              value={form.guardianId || ""}
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
              href={`/santri/${id}`}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Update Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
