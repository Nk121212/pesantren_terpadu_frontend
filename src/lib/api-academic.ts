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

export const academicApi = {
  async createSubject(
    data: CreateSubjectDto
  ): Promise<ApiResponse<AcademicSubject>> {
    try {
      const res = await apiFetch(`/academic/subject`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error creating grade:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat nilai",
      };
    }
  },

  async listGrades(params?: {
    skip?: number;
    take?: number;
    santriId?: number;
    subjectId?: number;
    semester?: number;
    year?: number;
  }): Promise<ApiResponse<AcademicGrade[]>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/academic/grade${qs}`, { method: "GET" });
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error creating attendance:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal membuat presensi",
      };
    }
  },

  // Di src/lib/api-academic.ts
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

      // Handle nested response structure berdasarkan contoh response Anda
      // Response: { success: true, data: { success: true, data: [...], meta: {...} } }
      if (
        res &&
        typeof res === "object" &&
        "success" in res &&
        res.success === true
      ) {
        const responseData = res as { success: boolean; data: any };

        if (responseData.data && typeof responseData.data === "object") {
          // Cek jika data memiliki struktur yang nested
          if (
            "success" in responseData.data &&
            "data" in responseData.data &&
            Array.isArray(responseData.data.data)
          ) {
            return {
              success: true,
              data: responseData.data.data as Attendance[],
            };
          }

          // Cek jika data langsung berupa array
          if (Array.isArray(responseData.data)) {
            return { success: true, data: responseData.data as Attendance[] };
          }
        }
      }

      console.error("Unhandled response structure:", res);
      return {
        success: false,
        error: "Format response tidak valid",
      };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
