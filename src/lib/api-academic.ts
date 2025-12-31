// lib/api-academic.ts
import { apiFetch, buildQueryString, ApiResponse } from "./api-core";

export interface AcademicSubject {
  id: number;
  name: string;
  description?: string;
  teacherId?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AcademicGrade {
  id: number;
  santriId: number;
  subjectId: number;
  score: number;
  remarks?: string;
  semester: number;
  year: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  santri?: {
    id: number;
    name: string;
  };
  subject?: {
    id: number;
    name: string;
  };
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  SICK = "SICK",
  PERMIT = "PERMIT",
}

export interface Attendance {
  id: number;
  santriId: number;
  date: string | Date;
  status: AttendanceStatus;
  remarks?: string;
  recordedBy?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  santri?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    name: string;
  };
}

export interface CreateSubjectDto {
  name: string;
  description?: string;
  teacherId?: number;
}

export interface CreateGradeDto {
  santriId: number;
  subjectId: number;
  score: number;
  remarks?: string;
  semester: number;
  year: number;
}

export interface CreateAttendanceDto {
  santriId: number;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedBy?: number;
}

export interface Grade {
  id: number;
  santriId: number;
  subjectId: number;
  score: number;
  remarks?: string | null;
  semester: number;
  year: number;
  createdAt: string;
  updatedAt: string;

  santri?: {
    id: number;
    name: string;
  };

  subject?: {
    id: number;
    name: string;
  };
}

type AcademicStatsRaw = {
  totalSubjects?: number;
  total_subjects?: number;
  totalGrades?: number;
  total_grades?: number;
  totalAttendance?: number;
  total_attendance?: number;
  averageScore?: number;
  average_score?: number;
};

// Type guard functions for better type safety
function isAcademicSubject(data: unknown): data is AcademicSubject {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    (obj.description === undefined || typeof obj.description === "string") &&
    (obj.teacherId === undefined || typeof obj.teacherId === "number")
  );
}

function isAcademicSubjectArray(data: unknown): data is AcademicSubject[] {
  return Array.isArray(data) && data.every(isAcademicSubject);
}

function isAcademicGrade(data: unknown): data is AcademicGrade {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "number" &&
    typeof obj.santriId === "number" &&
    typeof obj.subjectId === "number" &&
    typeof obj.score === "number" &&
    typeof obj.semester === "number" &&
    typeof obj.year === "number"
  );
}

function isAcademicGradeArray(data: unknown): data is AcademicGrade[] {
  return Array.isArray(data) && data.every(isAcademicGrade);
}

function isAttendance(data: unknown): data is Attendance {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "number" &&
    typeof obj.santriId === "number" &&
    (typeof obj.date === "string" || obj.date instanceof Date) &&
    Object.values(AttendanceStatus).includes(obj.status as AttendanceStatus)
  );
}

function isAttendanceArray(data: unknown): data is Attendance[] {
  return Array.isArray(data) && data.every(isAttendance);
}

function isMessageResponse(data: unknown): data is { message: string } {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.message === "string";
}

function isTeacherArray(data: unknown): data is Teacher[] {
  if (!Array.isArray(data)) return false;
  return data.every((item) => {
    if (!item || typeof item !== "object") return false;
    const teacher = item as Record<string, unknown>;
    return (
      typeof teacher.id === "number" &&
      typeof teacher.name === "string" &&
      typeof teacher.email === "string" &&
      typeof teacher.role === "string"
    );
  });
}

export const academicApi = {
  async createSubject(
    data: CreateSubjectDto
  ): Promise<ApiResponse<AcademicSubject>> {
    try {
      const res = await apiFetch(`/academic/subject`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (isAcademicSubject(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid subject data structure:", res.data);
        return {
          success: false,
          error: "Data mata pelajaran tidak valid",
        };
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat mata pelajaran",
      };
    }
  },

  async listSubjects(params?: {
    skip?: number;
    take?: number;
    teacherId?: number;
  }): Promise<ApiResponse<AcademicSubject[]>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/academic/subject${qs}`, { method: "GET" });

      if (isAcademicSubjectArray(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid subjects array structure:", res.data);
        return {
          success: false,
          error: "Data mata pelajaran tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data mata pelajaran",
      };
    }
  },

  async getSubject(id: number): Promise<ApiResponse<AcademicSubject>> {
    try {
      const res = await apiFetch(`/academic/subject/${id}`, { method: "GET" });

      if (isAcademicSubject(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid subject data structure:", res.data);
        return {
          success: false,
          error: "Data mata pelajaran tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching subject:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data mata pelajaran",
      };
    }
  },

  async updateSubject(
    id: number,
    data: Partial<CreateSubjectDto>
  ): Promise<ApiResponse<AcademicSubject>> {
    try {
      const res = await apiFetch(`/academic/subject/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (isAcademicSubject(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid subject data structure:", res.data);
        return {
          success: false,
          error: "Data mata pelajaran tidak valid",
        };
      }
    } catch (error) {
      console.error("Error updating subject:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengupdate mata pelajaran",
      };
    }
  },

  async deleteSubject(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await apiFetch(`/academic/subject/${id}`, {
        method: "DELETE",
      });

      if (isMessageResponse(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid message response structure:", res.data);
        return {
          success: false,
          error: "Response tidak valid",
        };
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus mata pelajaran",
      };
    }
  },

  async createGrade(data: CreateGradeDto): Promise<ApiResponse<AcademicGrade>> {
    try {
      const res = await apiFetch(`/academic/grade`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (isAcademicGrade(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid grade data structure:", res.data);
        return {
          success: false,
          error: "Data nilai tidak valid",
        };
      }
    } catch (error) {
      console.error("Error creating grade:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat nilai",
      };
    }
  },

  async listGrades(params?: {
    page?: number;
    take?: number;
    santriId?: number;
    subjectId?: number;
    year?: number;
    semester?: number;
  }): Promise<
    ApiResponse<{
      data: Grade[];
      meta?: {
        total: number;
        skip: number;
        take: number;
        hasMore: boolean;
      };
    }>
  > {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/academic/grade${qs}`, {
        method: "GET",
      });

      /**
       * Backend response shape:
       * {
       *   success: true,
       *   data: {
       *     success: true,
       *     data: Grade[],
       *     meta: {...}
       *   }
       * }
       */

      const payload = res.data;

      if (
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray((payload as { data?: unknown }).data)
      ) {
        return {
          success: true,
          data: {
            data: (payload as { data: Grade[] }).data,
            meta: (payload as { meta?: unknown }).meta as
              | {
                  total: number;
                  skip: number;
                  take: number;
                  hasMore: boolean;
                }
              | undefined,
          },
        };
      }

      console.error("Invalid grades array structure:", res.data);
      return {
        success: false,
        error: "Data nilai tidak valid",
      };
    } catch (error) {
      console.error("Error fetching grades:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil data nilai",
      };
    }
  },

  async getGrade(id: number): Promise<ApiResponse<AcademicGrade>> {
    try {
      const res = await apiFetch(`/academic/grade/${id}`, { method: "GET" });

      if (isAcademicGrade(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid grade data structure:", res.data);
        return {
          success: false,
          error: "Data nilai tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching grade:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil data nilai",
      };
    }
  },

  async updateGrade(
    id: number,
    data: Partial<CreateGradeDto>
  ): Promise<ApiResponse<AcademicGrade>> {
    try {
      const res = await apiFetch(`/academic/grade/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (isAcademicGrade(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid grade data structure:", res.data);
        return {
          success: false,
          error: "Data nilai tidak valid",
        };
      }
    } catch (error) {
      console.error("Error updating grade:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengupdate nilai",
      };
    }
  },

  async deleteGrade(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await apiFetch(`/academic/grade/${id}`, { method: "DELETE" });

      if (isMessageResponse(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid message response structure:", res.data);
        return {
          success: false,
          error: "Response tidak valid",
        };
      }
    } catch (error) {
      console.error("Error deleting grade:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus nilai",
      };
    }
  },

  async createAttendance(
    data: CreateAttendanceDto
  ): Promise<ApiResponse<Attendance>> {
    try {
      const res = await apiFetch(`/academic/attendance`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (isAttendance(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid attendance data structure:", res.data);
        return {
          success: false,
          error: "Data presensi tidak valid",
        };
      }
    } catch (error) {
      console.error("Error creating attendance:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal membuat presensi",
      };
    }
  },

  async listAttendance(params?: {
    skip?: number;
    take?: number;
    santriId?: number;
    date?: string;
    status?: AttendanceStatus;
    search?: string;
  }): Promise<ApiResponse<Attendance[]>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/academic/attendance${qs}`, {
        method: "GET",
      });

      console.log("Raw attendance API response:", res);

      // Handle nested response structure
      let dataToCheck = res.data;
      if (
        res &&
        typeof res === "object" &&
        "success" in res &&
        res.success === true
      ) {
        const responseData = res as { success: boolean; data: unknown };

        if (responseData.data && typeof responseData.data === "object") {
          // Cek jika data memiliki struktur yang nested
          const nestedData = responseData.data as Record<string, unknown>;
          if ("success" in nestedData && "data" in nestedData) {
            dataToCheck = nestedData.data;
          } else if (Array.isArray(responseData.data)) {
            dataToCheck = responseData.data;
          }
        }
      }

      if (isAttendanceArray(dataToCheck)) {
        return { success: true, data: dataToCheck };
      } else {
        console.error("Invalid attendance array structure:", dataToCheck);
        return {
          success: false,
          error: "Format response tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data presensi",
      };
    }
  },

  async getAttendance(id: number): Promise<ApiResponse<Attendance>> {
    try {
      const res = await apiFetch(`/academic/attendance/${id}`, {
        method: "GET",
      });

      if (isAttendance(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid attendance data structure:", res.data);
        return {
          success: false,
          error: "Data presensi tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data presensi",
      };
    }
  },

  async updateAttendance(
    id: number,
    data: Partial<CreateAttendanceDto>
  ): Promise<ApiResponse<Attendance>> {
    try {
      const res = await apiFetch(`/academic/attendance/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (isAttendance(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid attendance data structure:", res.data);
        return {
          success: false,
          error: "Data presensi tidak valid",
        };
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengupdate presensi",
      };
    }
  },

  async deleteAttendance(
    id: number
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await apiFetch(`/academic/attendance/${id}`, {
        method: "DELETE",
      });

      if (isMessageResponse(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid message response structure:", res.data);
        return {
          success: false,
          error: "Response tidak valid",
        };
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal menghapus presensi",
      };
    }
  },

  async getStats(): Promise<
    ApiResponse<{
      totalSubjects: number;
      totalGrades: number;
      totalAttendance: number;
      averageScore: number;
    }>
  > {
    try {
      const res = await apiFetch(`/academic/stats`, { method: "GET" });

      const raw = (res.data ?? {}) as AcademicStatsRaw;

      const normalized = {
        totalSubjects: Number(raw.totalSubjects ?? raw.total_subjects ?? 0),
        totalGrades: Number(raw.totalGrades ?? raw.total_grades ?? 0),
        totalAttendance: Number(
          raw.totalAttendance ?? raw.total_attendance ?? 0
        ),
        averageScore: Number(raw.averageScore ?? raw.average_score ?? 0),
      };

      if (
        Number.isFinite(normalized.totalSubjects) &&
        Number.isFinite(normalized.totalGrades) &&
        Number.isFinite(normalized.totalAttendance) &&
        Number.isFinite(normalized.averageScore)
      ) {
        return {
          success: true,
          data: normalized,
        };
      }

      console.error("Invalid stats data after normalization:", res.data);
      return {
        success: false,
        error: "Data statistik tidak valid",
      };
    } catch (error) {
      console.error("Error fetching academic stats:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil statistik akademik",
      };
    }
  },
};

export interface Teacher {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const teachersApi = {
  async list(): Promise<ApiResponse<Teacher[]>> {
    try {
      const res = await apiFetch(`/users?role=TEACHER`, { method: "GET" });

      if (isTeacherArray(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid teachers array structure:", res.data);
        return {
          success: false,
          error: "Data guru tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil data guru",
      };
    }
  },
};
