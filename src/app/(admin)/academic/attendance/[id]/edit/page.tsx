"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  Loader2,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import {
  academicApi,
  AttendanceStatus,
  CreateAttendanceDto,
  santriApi,
  Santri,
} from "@/lib/api";

export default function EditAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [formData, setFormData] = useState({
    santriId: "",
    date: "",
    status: AttendanceStatus.PRESENT,
    remarks: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const id = Number(params.id);

      // Fetch attendance data
      const attendanceRes = await academicApi.getAttendance(id);

      if (attendanceRes && typeof attendanceRes === "object") {
        let attendanceData: any;

        // Handle response format
        if ("data" in attendanceRes && attendanceRes.data) {
          attendanceData = attendanceRes.data;
        } else {
          attendanceData = attendanceRes;
        }

        // Format date for input field (YYYY-MM-DD)
        const date = new Date(attendanceData.date);
        const formattedDate = date.toISOString().split("T")[0];

        setFormData({
          santriId: attendanceData.santriId.toString(),
          date: formattedDate,
          status: attendanceData.status,
          remarks: attendanceData.remarks || "",
        });
      }

      // Fetch santri list
      const santriRes = await santriApi.list({ per_page: 100 });

      if (santriRes && typeof santriRes === "object") {
        let santriData: Santri[];

        if ("data" in santriRes) {
          santriData = santriRes.data as Santri[];
        } else if (Array.isArray(santriRes)) {
          santriData = santriRes;
        } else if ("data" in santriRes && Array.isArray(santriRes.data)) {
          santriData = santriRes.data;
        } else {
          santriData = [];
        }

        setSantriList(santriData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.santriId) {
      newErrors.santriId = "Santri harus dipilih";
    }

    if (!formData.date) {
      newErrors.date = "Tanggal harus diisi";
    }

    if (!formData.status) {
      newErrors.status = "Status harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Di Edit Page, handleSubmit:

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const id = Number(params.id);
      const dateString = new Date(
        formData.date + "T00:00:00.000Z"
      ).toISOString();

      const payload: Partial<CreateAttendanceDto> = {
        santriId: Number(formData.santriId),
        date: dateString,
        status: formData.status as AttendanceStatus,
        remarks: formData.remarks || undefined,
      };

      await academicApi.updateAttendance(id, payload);

      // Log audit trail
      try {
        const santriName =
          santriList.find((s) => s.id === Number(formData.santriId))?.name ||
          "Unknown";

        await academicApi.logAction({
          module: "ATTENDANCE",
          action: "UPDATE",
          recordId: id,
          note: `Memperbarui absensi ID: ${id} untuk santri: ${santriName}`,
        });
      } catch (auditError) {
        console.error("Failed to log audit:", auditError);
      }

      alert("Absensi berhasil diperbarui");

      // Kembali ke halaman utama/list absensi
      router.push("/academic/attendance");
    } catch (error) {
      console.error("Failed to update attendance:", error);

      // Tampilkan error message yang lebih spesifik
      if (error instanceof Error) {
        if (error.message.includes("Foreign key constraint")) {
          alert("Santri tidak ditemukan. Pastikan data santri valid.");
        } else if (
          error.message.includes("ISO-8601") ||
          error.message.includes("date")
        ) {
          alert("Format tanggal tidak valid. Gunakan format YYYY-MM-DD.");
        } else {
          alert(`Gagal memperbarui absensi: ${error.message}`);
        }
      } else {
        alert("Gagal memperbarui absensi. Silakan coba lagi.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/academic/attendance/${params.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Absensi</h1>
            <p className="text-gray-600 mt-1">Perbarui data kehadiran santri</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/academic/attendance/${params.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <X className="w-4 h-4" />
            Batal
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Data Absensi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Santri Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Santri <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="santriId"
                  value={formData.santriId}
                  onChange={handleChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.santriId ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white`}
                >
                  <option value="">Pilih Santri</option>
                  {santriList.map((santri) => (
                    <option key={santri.id} value={santri.id}>
                      {santri.name} {santri.gender === "Pria" ? "♂" : "♀"}
                    </option>
                  ))}
                </select>
                {errors.santriId && (
                  <p className="mt-1 text-sm text-red-600">{errors.santriId}</p>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Kehadiran <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border ${
                  errors.status ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500`}
              >
                <option value={AttendanceStatus.PRESENT}>Hadir</option>
                <option value={AttendanceStatus.SICK}>Sakit</option>
                <option value={AttendanceStatus.PERMITTED}>Izin</option>
                <option value={AttendanceStatus.ABSENT}>Absen</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Masukkan keterangan tambahan (jika ada)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Contoh: "Hadir tepat waktu", "Izin sakit dengan surat dokter",
                "Izin keluarga", dll.
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">Perhatian</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Pastikan data yang diisi sudah benar sebelum disimpan</li>
                <li>
                  • Data yang sudah disimpan akan mempengaruhi laporan kehadiran
                </li>
                <li>• Perubahan data akan tercatat dalam sistem</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
