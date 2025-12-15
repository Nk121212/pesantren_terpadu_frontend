// lib/api-tahfidz.ts
import { apiFetch, buildQueryString, ApiResponse } from "./api-core";

export interface TahfidzRecord {
  id: number;
  santriId: number;
  juz: number;
  pageStart: number;
  pageEnd: number;
  score?: number;
  remarks?: string;
  teacherId?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  santri?: {
    id: number;
    name: string;
    gender: string;
    birthDate?: string;
    address?: string;
  };
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedTahfidzResponse {
  data: TahfidzRecord[];
  meta: PaginationMeta;
}

export interface TahfidzOverviewStats {
  totalRecords: number;
  totalSantri: number;
  averageScore: number;
  totalPagesMemorized: number;
  juzDistribution: Array<{ juz: number; count: number }>;
  recentActivity: number;
}

export interface SantriTahfidzStats {
  santri: { id: number; name: string };
  totalRecords: number;
  completedJuz: number;
  averageScore: number;
  totalPagesMemorized: number;
  lastRecord: TahfidzRecord | null;
  progressByJuz: Array<{ juz: number; pages: number; completion: number }>;
  progressPercentage: number;
}

export interface CreateTahfidzDto {
  santriId: number;
  juz: number;
  pageStart: number;
  pageEnd: number;
  score?: number;
  remarks?: string;
  teacherId?: number;
  createdAt?: string;
}

export interface UpdateTahfidzDto {
  santriId?: number;
  juz?: number;
  pageStart?: number;
  pageEnd?: number;
  score?: number;
  remarks?: string;
  teacherId?: number;
}

export interface GetAllTahfidzParams {
  skip?: number;
  take?: number;
  santriId?: number;
  juz?: number;
  teacherId?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface DeleteTahfidzResponse {
  success: boolean;
  message: string;
}

export const tahfidzApi = {
  async create(data: CreateTahfidzDto): Promise<ApiResponse<TahfidzRecord>> {
    try {
      const res = await apiFetch(`/tahfidz`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error creating tahfidz record:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat catatan hafalan",
      };
    }
  },

  async getAll(
    params?: GetAllTahfidzParams
  ): Promise<ApiResponse<PaginatedTahfidzResponse>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/tahfidz${qs}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching tahfidz records:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data hafalan",
      };
    }
  },

  async getBySantri(santriId: number): Promise<ApiResponse<TahfidzRecord[]>> {
    try {
      const res = await apiFetch(`/tahfidz/santri/${santriId}`, {
        method: "GET",
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching tahfidz by santri:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data hafalan santri",
      };
    }
  },

  async getById(id: number): Promise<ApiResponse<TahfidzRecord>> {
    try {
      const res = await apiFetch(`/tahfidz/${id}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching tahfidz record:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data hafalan",
      };
    }
  },

  async update(
    id: number,
    data: UpdateTahfidzDto
  ): Promise<ApiResponse<TahfidzRecord>> {
    try {
      const res = await apiFetch(`/tahfidz/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error updating tahfidz record:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengupdate catatan hafalan",
      };
    }
  },

  async partialUpdate(
    id: number,
    data: Partial<UpdateTahfidzDto>
  ): Promise<ApiResponse<TahfidzRecord>> {
    try {
      const res = await apiFetch(`/tahfidz/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error partially updating tahfidz record:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengupdate catatan hafalan",
      };
    }
  },

  async delete(id: number): Promise<ApiResponse<DeleteTahfidzResponse>> {
    try {
      const res = await apiFetch(`/tahfidz/${id}`, { method: "DELETE" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error deleting tahfidz record:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus catatan hafalan",
      };
    }
  },

  async getOverviewStats(): Promise<ApiResponse<TahfidzOverviewStats>> {
    try {
      const res = await apiFetch(`/tahfidz/stats/overview`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching tahfidz stats:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil statistik hafalan",
      };
    }
  },

  async getSantriStats(
    santriId: number
  ): Promise<ApiResponse<SantriTahfidzStats>> {
    try {
      const res = await apiFetch(`/tahfidz/stats/santri/${santriId}`, {
        method: "GET",
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching santri tahfidz stats:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil statistik santri",
      };
    }
  },

  async getRecent(limit: number = 10): Promise<ApiResponse<TahfidzRecord[]>> {
    try {
      const res = await apiFetch(`/tahfidz/recent/${limit}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching recent tahfidz records:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data terbaru",
      };
    }
  },
};
