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
} from "lucide-react";

export default function DetailSantriPage() {
  const { id } = useParams();
  const [santri, setSantri] = useState<Santri | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    santriApi
      .get(Number(id))
      .then((res) => {
        setSantri(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!santri) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Santri tidak ditemukan
          </h2>
          <Link href="/santri" className="text-blue-600 hover:text-blue-700">
            Kembali ke daftar santri
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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

              {/* Tambahkan field address */}
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
              {/* Tambahkan field guardian */}
              {santri.guardianId && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-800 mb-1">
                    Wali Santri
                  </p>
                  <p className="text-purple-900">ID: {santri.guardianId}</p>
                  {/* Anda bisa menambahkan nama wali jika tersedia */}
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-1">Status</p>
                <p className="text-blue-900">Aktif</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800 mb-1">
                  Terdaftar Sejak
                </p>
                <p className="text-green-900">
                  {new Date().toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
