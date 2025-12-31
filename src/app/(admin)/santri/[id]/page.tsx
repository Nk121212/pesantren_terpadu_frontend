"use client";

import { useEffect, useState } from "react";
import { santriApi, type Santri } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  User,
  Calendar,
  VenusAndMars,
  MapPin,
  Users,
} from "lucide-react";

export default function DetailSantriPage() {
  const { id } = useParams();
  const [santri, setSantri] = useState<Santri | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    santriApi
      .get(Number(id))
      .then((response) => {
        if (response.success && response.data) {
          console.log("santri edit", response);
          setSantri(response.data);
        } else {
          setError(response.error || "Gagal memuat data santri");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error instanceof Error ? error.message : "Terjadi kesalahan");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !santri) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Santri tidak ditemukan"}
          </h2>
          <p className="text-gray-600 mb-4">
            Data santri tidak dapat dimuat atau tidak tersedia
          </p>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {}
      <div className="flex items-center gap-4">
        <Link
          href="/santri"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Detail Santri
          </h1>
          <p className="text-gray-600 mt-1">Informasi lengkap data santri</p>
        </div>
        <Link
          href={`/santri/${santri.id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          <Edit className="w-4 h-4" />
          Edit Data
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{santri.name}</h2>
              <p className="text-blue-100">ID: {santri.id}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <VenusAndMars className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Jenis Kelamin</p>
                  <p className="font-medium text-gray-900">{santri.gender}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Tanggal Lahir</p>
                  <p className="font-medium text-gray-900">
                    {santri.birthDate
                      ? new Date(santri.birthDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Alamat */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Alamat</p>
                  <p className="font-medium text-gray-900">
                    {santri.address || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Wali Santri */}
              {santri.guardianId ? (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-medium text-purple-800">
                      Wali Santri
                    </p>
                  </div>
                  <p className="text-purple-900">
                    ID Wali: {santri.guardianId}
                  </p>
                  {/* 
                    Jika Anda memiliki data wali, Anda bisa menampilkan:
                    <p className="text-sm text-purple-700 mt-1">{guardianName}</p>
                    <p className="text-sm text-purple-600">{guardianPhone}</p>
                  */}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Wali Santri
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Belum ada wali yang ditetapkan
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-blue-900">Aktif</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800 mb-1">
                  Tanggal Registrasi
                </p>
                <p className="text-green-900">
                  {santri.birthDate
                    ? new Date(santri.birthDate).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Link
          href="/santri"
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Kembali
        </Link>
        <button
          onClick={async () => {
            if (
              confirm(
                `Apakah Anda yakin ingin menghapus santri ${santri.name}?`
              )
            ) {
              try {
                const response = await santriApi.remove(santri.id);
                if (response.success) {
                  alert("Santri berhasil dihapus");
                  window.location.href = "/santri";
                } else {
                  alert(response.error || "Gagal menghapus santri");
                }
              } catch (error) {
                alert("Terjadi kesalahan saat menghapus santri");
              }
            }
          }}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
        >
          Hapus Santri
        </button>
      </div>
    </div>
  );
}
