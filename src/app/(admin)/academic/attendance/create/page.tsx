"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  academicApi,
  AttendanceStatus,
  CreateAttendanceDto,
  santriApi,
  Santri,
  teachersApi,
  Teacher,
} from "@/lib/api";

// Type guard untuk response API
function isApiResponseWithData<T>(
  response: unknown
): response is { data: T[]; success?: boolean } {
  if (response === null || typeof response !== "object") {
    return false;
  }

  const obj = response as Record<string, unknown>;

  // Check if data exists and is an array
  if (!("data" in obj) || !Array.isArray(obj.data)) {
    return false;
  }

  return true;
}

function isApiResponseWithSuccess<T>(
  response: unknown
): response is { success: true; data: T[] } {
  if (response === null || typeof response !== "object") {
    return false;
  }

  const obj = response as Record<string, unknown>;

  // Check if success is true
  if (!("success" in obj) || obj.success !== true) {
    return false;
  }

  // Check if data exists and is an array
  if (!("data" in obj) || !Array.isArray(obj.data)) {
    return false;
  }

  return true;
}

function isArrayOf<T>(response: unknown): response is T[] {
  return Array.isArray(response);
}

export default function CreateAttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [teacherList, setTeacherList] = useState<Teacher[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    santriId: "",
    date: new Date().toISOString().split("T")[0],
    status: AttendanceStatus.PRESENT,
    remarks: "",
    recordedBy: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch santri list
      const santriRes = await santriApi.list({ per_page: 100 });

      if (santriRes) {
        let santriData: Santri[] = [];

        // Gunakan type guards yang aman
        if (isApiResponseWithSuccess<Santri>(santriRes)) {
          santriData = santriRes.data;
        } else if (isApiResponseWithData<Santri>(santriRes)) {
          santriData = santriRes.data;
        } else if (isArrayOf<Santri>(santriRes)) {
          santriData = santriRes;
        }

        setSantriList(santriData);
      }

      // Fetch teacher list
      const teacherRes = await teachersApi.list();

      if (teacherRes) {
        let teacherData: Teacher[] = [];

        // Gunakan type guards yang sama
        if (isApiResponseWithSuccess<Teacher>(teacherRes)) {
          teacherData = teacherRes.data;
        } else if (isApiResponseWithData<Teacher>(teacherRes)) {
          teacherData = teacherRes.data;
        } else if (isArrayOf<Teacher>(teacherRes)) {
          teacherData = teacherRes;
        }

        setTeacherList(teacherData);

        // Set default recordedBy to first teacher if available
        if (teacherData.length > 0 && !formData.recordedBy) {
          setFormData((prev) => ({
            ...prev,
            recordedBy: teacherData[0].id.toString(),
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Gagal mengambil data santri dan guru");
    } finally {
      setLoading(false);
    }
  }, [formData.recordedBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.santriId) {
      newErrors.santriId = "Santri harus dipilih";
    }

    if (!formData.date) {
      newErrors.date = "Tanggal harus diisi";
    }

    if (!formData.status) {
      newErrors.status = "Status kehadiran harus dipilih";
    }

    if (!formData.recordedBy) {
      newErrors.recordedBy = "Pencatat harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleStatusChange = useCallback((status: AttendanceStatus) => {
    setFormData((prev) => ({
      ...prev,
      status,
    }));
    setErrors((prev) => ({ ...prev, status: "" }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Convert date to ISO string
      const dateString = new Date(
        formData.date + "T00:00:00.000Z"
      ).toISOString();

      const payload: CreateAttendanceDto = {
        santriId: Number(formData.santriId),
        date: dateString,
        status: formData.status as AttendanceStatus,
        remarks: formData.remarks || undefined,
        recordedBy: Number(formData.recordedBy),
      };

      console.log("Sending payload:", payload);

      const result = await academicApi.createAttendance(payload);

      let attendanceId: number | undefined;

      if (result && typeof result === "object") {
        // Convert to unknown first, then to Record<string, unknown>
        const resultObj = result as unknown as Record<string, unknown>;

        if ("success" in resultObj && resultObj.success === true) {
          const data = resultObj.data as Record<string, unknown> | undefined;
          if (data && "id" in data && typeof data.id === "number") {
            attendanceId = data.id;
          }
        } else if ("id" in resultObj && typeof resultObj.id === "number") {
          attendanceId = resultObj.id as number;
        }
      }

      // Log audit trail
      try {
        const santriName =
          santriList.find((s) => s.id === Number(formData.santriId))?.name ||
          "Unknown";

        await academicApi.logAction({
          module: "ATTENDANCE",
          action: "CREATE",
          recordId: attendanceId,
          note: `Membuat absensi baru untuk santri: ${santriName} (ID: ${formData.santriId})`,
        });
      } catch (auditError) {
        console.error("Failed to log audit:", auditError);
      }

      alert("Absensi berhasil dibuat!");

      // Kembali ke halaman utama/list absensi
      router.push("/academic/attendance");
    } catch (error) {
      console.error("Failed to create attendance:", error);

      if (error instanceof Error) {
        if (error.message.includes("Foreign key constraint")) {
          alert("Santri atau guru tidak ditemukan. Pastikan data valid.");
        } else if (error.message.includes("ISO-8601")) {
          alert("Format tanggal tidak valid. Gunakan format YYYY-MM-DD.");
        } else {
          alert(`Gagal membuat absensi: ${error.message}`);
        }
      } else {
        alert("Gagal membuat absensi. Silakan coba lagi.");
      }
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = useCallback((status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case AttendanceStatus.SICK:
      case AttendanceStatus.PERMIT:
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case AttendanceStatus.ABSENT:
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  }, []);

  const getStatusColor = useCallback((status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "bg-green-100 text-green-800 border-green-200";
      case AttendanceStatus.SICK:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case AttendanceStatus.PERMIT:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case AttendanceStatus.ABSENT:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  const statusOptions = [
    {
      value: AttendanceStatus.PRESENT,
      label: "Hadir",
      description: "Santri hadir sesuai jadwal",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    {
      value: AttendanceStatus.SICK,
      label: "Sakit",
      description: "Santri tidak hadir karena sakit",
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
    },
    {
      value: AttendanceStatus.PERMIT,
      label: "Izin",
      description: "Santri izin dengan alasan tertentu",
      icon: <Clock className="w-5 h-5 text-blue-600" />,
    },
    {
      value: AttendanceStatus.ABSENT,
      label: "Absen",
      description: "Santri tidak hadir tanpa keterangan",
      icon: <XCircle className="w-5 h-5 text-red-600" />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/academic/attendance"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Kembali ke daftar absensi"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tambah Absensi Santri
          </h1>
          <p className="text-gray-600 mt-1">
            Rekam kehadiran santri untuk hari ini
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Data Absensi Baru
          </h2>

          <div className="space-y-6">
            {/* Santri Selection */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="santriId"
              >
                Santri <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="santriId"
                  name="santriId"
                  value={formData.santriId}
                  onChange={handleChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.santriId ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white`}
                  aria-invalid={!!errors.santriId}
                  aria-describedby={
                    errors.santriId ? "santriId-error" : undefined
                  }
                >
                  <option value="">Pilih Santri</option>
                  {santriList.map((santri) => (
                    <option key={santri.id} value={santri.id}>
                      {santri.name} (
                      {santri.gender === "Pria" ? "Laki-laki" : "Perempuan"})
                    </option>
                  ))}
                </select>
                {errors.santriId && (
                  <p id="santriId-error" className="mt-1 text-sm text-red-600">
                    {errors.santriId}
                  </p>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="date"
              >
                Tanggal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  aria-invalid={!!errors.date}
                  aria-describedby={errors.date ? "date-error" : undefined}
                />
                {errors.date && (
                  <p id="date-error" className="mt-1 text-sm text-red-600">
                    {errors.date}
                  </p>
                )}
              </div>
            </div>

            {/* Status Selection with Cards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status Kehadiran <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {statusOptions.map((statusOption) => (
                  <button
                    key={`status-${statusOption.value}`}
                    type="button"
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-left ${
                      formData.status === statusOption.value
                        ? getStatusColor(statusOption.value)
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      handleStatusChange(statusOption.value as AttendanceStatus)
                    }
                    aria-pressed={formData.status === statusOption.value}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {statusOption.icon}
                      <span className="font-semibold">
                        {statusOption.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {statusOption.description}
                    </p>
                  </button>
                ))}
              </div>
              {errors.status && (
                <p id="status-error" className="mt-1 text-sm text-red-600">
                  {errors.status}
                </p>
              )}
            </div>

            {/* Recorded By */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="recordedBy"
              >
                Dicatat Oleh <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="recordedBy"
                  name="recordedBy"
                  value={formData.recordedBy}
                  onChange={handleChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.recordedBy ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white`}
                  aria-invalid={!!errors.recordedBy}
                  aria-describedby={
                    errors.recordedBy ? "recordedBy-error" : undefined
                  }
                >
                  <option value="">Pilih Pencatat</option>
                  {teacherList.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.role})
                    </option>
                  ))}
                </select>
                {errors.recordedBy && (
                  <p
                    id="recordedBy-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.recordedBy}
                  </p>
                )}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="remarks"
              >
                Keterangan (Opsional)
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Masukkan keterangan tambahan jika diperlukan..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Contoh: `Hadir tepat waktu`, `Izin sakit dengan surat dokter`,
                `Izin keluarga penting`, `dll`.
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">
                Catatan Penting
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
                <li>Pastikan data yang diisi sudah benar sebelum disimpan</li>
                <li>
                  Status kehadiran akan mempengaruhi laporan dan statistik
                </li>
                <li>
                  Data yang sudah disimpan dapat diedit nanti jika diperlukan
                </li>
                <li>
                  Sistem akan mencatat siapa yang membuat entri absensi ini
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/academic/attendance"
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Absensi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
