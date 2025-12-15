"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { santriApi, type Santri, type Guardian } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Edit2, AlertCircle } from "lucide-react";

interface UpdateSantriData {
  name?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  guardianId?: number;
}

export default function EditSantriPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [guardiansLoading, setGuardiansLoading] = useState(true);
  const [form, setForm] = useState<Partial<Santri>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch santri data
        const santriResponse = await santriApi.get(Number(id));

        if (!santriResponse.success || !santriResponse.data) {
          throw new Error(santriResponse.error || "Gagal memuat data santri");
        }

        const santri = santriResponse.data;
        setForm({
          name: santri.name || "",
          gender: santri.gender || "",
          birthDate: santri.birthDate ? santri.birthDate.split("T")[0] : "",
          address: santri.address || "",
          guardianId: santri.guardianId || undefined,
        });

        // Fetch guardians data
        try {
          const guardiansResponse = await santriApi.getGuardians();
          if (guardiansResponse.success && guardiansResponse.data) {
            const guardiansData = Array.isArray(guardiansResponse.data)
              ? guardiansResponse.data
              : [];
            setGuardians(guardiansData);
          } else {
            setGuardians([]);
          }
        } catch (guardianError) {
          console.error("Failed to fetch guardians:", guardianError);
          setGuardians([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error instanceof Error ? error.message : "Terjadi kesalahan");
      } finally {
        setInitialLoading(false);
        setGuardiansLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "guardianId"
          ? value === ""
            ? undefined
            : Number(value)
          : value,
    }));
  };

  // Fungsi untuk membersihkan data sebelum dikirim
  const prepareUpdateData = (formData: Partial<Santri>): UpdateSantriData => {
    const updateData: UpdateSantriData = {};

    // Hanya kirim field yang ada nilainya dan sesuai dengan DTO
    if (formData.name !== undefined && formData.name.trim() !== "") {
      updateData.name = formData.name.trim();
    }

    if (formData.gender !== undefined && formData.gender.trim() !== "") {
      updateData.gender = formData.gender;
    }

    if (formData.birthDate !== undefined && formData.birthDate.trim() !== "") {
      updateData.birthDate = formData.birthDate;
    }

    if (formData.address !== undefined) {
      updateData.address = formData.address.trim();
    }

    // Handle guardianId
    if (formData.guardianId !== undefined) {
      updateData.guardianId = formData.guardianId;
    }

    return updateData;
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Validasi field wajib
    if (!form.name?.trim()) {
      setError("Nama santri harus diisi");
      return;
    }
    if (!form.gender?.trim()) {
      setError("Jenis kelamin harus dipilih");
      return;
    }
    if (!form.birthDate?.trim()) {
      setError("Tanggal lahir harus diisi");
      return;
    }
    if (!form.address?.trim()) {
      setError("Alamat harus diisi");
      return;
    }

    setLoading(true);

    try {
      // Siapkan data yang akan dikirim
      const updateData = prepareUpdateData(form);

      // Kirim update request
      const response = await santriApi.update(Number(id), updateData);

      if (response.success) {
        // Redirect ke halaman detail santri
        router.push(`/santri/${id}`);
        router.refresh();
      } else {
        setError(response.error || "Gagal mengupdate santri");
      }
    } catch (error) {
      console.error("Update failed:", error);
      setError("Terjadi kesalahan saat mengupdate santri");
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

  // Ensure id is not undefined
  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ID Santri Tidak Ditemukan
          </h2>
          <Link
            href="/santri"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Kembali ke daftar santri
          </Link>
        </div>
      </div>
    );
  }

  if (error && !form.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/santri"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke daftar santri
          </Link>
        </div>
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg">
          <User className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-blue-600 font-medium">Sedang mengedit</p>
            <p className="text-blue-800">
              {form.name || "Santri"} (ID: {id})
            </p>
          </div>
        </div>

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
              value={form.name || ""}
              onChange={handleChange}
              disabled={loading}
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
              disabled={loading}
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
              value={form.birthDate || ""}
              onChange={handleChange}
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading || guardiansLoading}
            >
              <option value="">Pilih Wali Santri (Opsional)</option>
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

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Link
              href={`/santri/${id}`}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => loading && e.preventDefault()}
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
