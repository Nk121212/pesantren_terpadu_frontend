// lib/api-counseling.ts
import { apiFetch, buildQueryString, ApiResponse } from "./api-core";

export enum CounselingStatus {
  PLANNED = "PLANNED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface CounselingSession {
  id: number;
  santriId: number;
  counselorId?: number;
  topic: string;
  notes?: string;
  recommendation?: string;
  status: CounselingStatus;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  santri?: {
    id: number;
    name: string;
    gender: string;
  };
  counselor?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateCounselingDto {
  santriId: number;
  counselorId?: number;
  topic: string;
  notes?: string;
  recommendation?: string;
  status?: CounselingStatus;
  scheduledAt?: string;
}

export interface UpdateCounselingStatusDto {
  status: CounselingStatus;
}

export const counselingApi = {
  async create(
    data: CreateCounselingDto
  ): Promise<ApiResponse<CounselingSession>> {
    try {
      const payload = {
        ...data,
        scheduledAt: data.scheduledAt
          ? new Date(data.scheduledAt).toISOString()
          : undefined,
      };

      const res = await apiFetch(`/counseling`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error creating counseling session:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat sesi konseling",
      };
    }
  },

  async list(params?: {
    skip?: number;
    take?: number;
    santriId?: number;
    counselorId?: number;
    status?: CounselingStatus;
  }): Promise<ApiResponse<CounselingSession[]>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/counseling${qs}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching counseling sessions:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data sesi konseling",
      };
    }
  },

  async get(id: number): Promise<ApiResponse<CounselingSession>> {
    try {
      const res = await apiFetch(`/counseling/${id}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching counseling session:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data sesi konseling",
      };
    }
  },

  async updateStatus(
    id: number,
    data: UpdateCounselingStatusDto
  ): Promise<ApiResponse<CounselingSession>> {
    try {
      const res = await apiFetch(`/counseling/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error updating counseling status:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengupdate status konseling",
      };
    }
  },
};

export interface Counselor {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export const counselorsApi = {
  async list(): Promise<ApiResponse<Counselor[]>> {
    try {
      const res = await apiFetch(`/users?role=TEACHER,STAFF,ADMIN,SUPERADMIN`, {
        method: "GET",
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching counselors:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data konselor",
      };
    }
  },
};
