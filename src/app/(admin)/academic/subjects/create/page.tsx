"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { academicApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, BookOpen } from "lucide-react";

export default function CreateSubjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    teacherId: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Nama mata pelajaran wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        teacherId: form.teacherId ? Number(form.teacherId) : undefined,
      };

      await academicApi.createSubject(submitData);
      router.push("/academic/subjects");
      router.refresh();
    } catch (error: unknown) {
      console.error("Create failed:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else if (typeof error === "string") {
        alert(error);
      } else if (error && typeof error === "object" && "message" in error) {
        // Check jika error adalah object dengan property message
        alert(String((error as { message: string }).message));
      } else {
        alert("Gagal menambah mata pelajaran. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {}
      <div className="flex items-center gap-4">
        <Link
          href="/academic/subjects"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Tambah Mata Pelajaran
          </h1>
          <p className="text-gray-600 mt-1">
            Buat mata pelajaran baru untuk kurikulum pesantren
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Mata Pelajaran *
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="Contoh: Matematika, Al-Quran, Bahasa Arab"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="Deskripsi singkat tentang mata pelajaran..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pengajar
            </label>
            <select
              name="teacherId"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              value={form.teacherId}
              onChange={handleChange}
            >
              <option value="">Pilih Pengajar</option>
              <option value="1">Ustadz Ahmad</option>
              <option value="2">Ustadzah Fatimah</option>
              <option value="3">Ustadz Yusuf</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Biarkan kosong jika belum ada pengajar tetap
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/academic/subjects"
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan Mata Pelajaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
