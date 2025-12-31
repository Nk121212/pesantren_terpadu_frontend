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

// Type guard functions
function isTahfidzRecord(data: unknown): data is TahfidzRecord {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === "number" &&
    typeof obj.santriId === "number" &&
    typeof obj.juz === "number" &&
    typeof obj.pageStart === "number" &&
    typeof obj.pageEnd === "number" &&
    (obj.score === undefined || typeof obj.score === "number") &&
    (obj.remarks === undefined || typeof obj.remarks === "string") &&
    (obj.teacherId === undefined || typeof obj.teacherId === "number")
  );
}

function isTahfidzRecordArray(data: unknown): data is TahfidzRecord[] {
  return Array.isArray(data) && data.every(isTahfidzRecord);
}

function isPaginationMeta(data: unknown): data is PaginationMeta {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.total === "number" &&
    typeof obj.page === "number" &&
    typeof obj.limit === "number" &&
    typeof obj.totalPages === "number"
  );
}

function isPaginatedTahfidzResponse(
  data: unknown
): data is PaginatedTahfidzResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    "data" in obj &&
    "meta" in obj &&
    isTahfidzRecordArray(obj.data) &&
    isPaginationMeta(obj.meta)
  );
}

function isJuzDistributionItem(
  data: unknown
): data is { juz: number; count: number } {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return typeof obj.juz === "number" && typeof obj.count === "number";
}

function isTahfidzOverviewStats(data: unknown): data is TahfidzOverviewStats {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (!("juzDistribution" in obj) || !Array.isArray(obj.juzDistribution)) {
    return false;
  }

  return (
    typeof obj.totalRecords === "number" &&
    typeof obj.totalSantri === "number" &&
    typeof obj.averageScore === "number" &&
    typeof obj.totalPagesMemorized === "number" &&
    typeof obj.recentActivity === "number" &&
    obj.juzDistribution.every(isJuzDistributionItem)
  );
}

function isSantriTahfidzStats(data: unknown): data is SantriTahfidzStats {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  // Check santri object
  if (!obj.santri || typeof obj.santri !== "object") return false;
  const santri = obj.santri as Record<string, unknown>;
  if (typeof santri.id !== "number" || typeof santri.name !== "string") {
    return false;
  }

  // Check lastRecord
  if (obj.lastRecord !== null && !isTahfidzRecord(obj.lastRecord)) {
    return false;
  }

  // Check progressByJuz array
  if (!("progressByJuz" in obj) || !Array.isArray(obj.progressByJuz)) {
    return false;
  }

  return (
    typeof obj.totalRecords === "number" &&
    typeof obj.completedJuz === "number" &&
    typeof obj.averageScore === "number" &&
    typeof obj.totalPagesMemorized === "number" &&
    typeof obj.progressPercentage === "number"
  );
}

function isDeleteTahfidzResponse(data: unknown): data is DeleteTahfidzResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return typeof obj.success === "boolean" && typeof obj.message === "string";
}

export const tahfidzApi = {
  async create(data: CreateTahfidzDto): Promise<ApiResponse<TahfidzRecord>> {
    try {
      const res = await apiFetch(`/tahfidz`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (isTahfidzRecord(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid tahfidz record data structure:", res.data);
        return {
          success: false,
          error: "Data catatan hafalan tidak valid",
        };
      }
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

  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      data: TahfidzRecord[];
      meta: PaginationMeta;
    }>
  > => {
    const skip = ((params?.page ?? 1) - 1) * (params?.limit ?? 10);
    const take = params?.limit ?? 10;

    const query = buildQueryString({ skip, take });

    const url = `/tahfidz${query}`;

    const res = await apiFetch<{
      data: {
        data: TahfidzRecord[];
        meta: PaginationMeta;
      };
    }>(url);

    const raw = res?.data;

    // BACKEND STRUCTURE: { success, data: { data, meta } }
    if (
      raw &&
      typeof raw === "object" &&
      "data" in raw &&
      "meta" in raw &&
      Array.isArray(raw.data)
    ) {
      return {
        success: true,
        data: {
          data: raw.data as TahfidzRecord[],
          meta: raw.meta as PaginationMeta,
        },
      };
    }

    console.error("Invalid paginated tahfidz response structure:", raw);

    return {
      success: false,
      data: {
        data: [],
        meta: {
          total: 0,
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          totalPages: 0,
        },
      },
      error: "Data tahfidz tidak valid",
    };
  },

  async getBySantri(santriId: number): Promise<ApiResponse<TahfidzRecord[]>> {
    try {
      const res = await apiFetch(`/tahfidz/santri/${santriId}`, {
        method: "GET",
      });

      if (isTahfidzRecordArray(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid tahfidz records array structure:", res.data);
        return {
          success: false,
          error: "Data hafalan santri array tidak valid",
        };
      }
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

      if (isTahfidzRecord(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid tahfidz record data structure:", res.data);
        return {
          success: false,
          error: "Data catatan hafalan tidak valid",
        };
      }
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

      if (isTahfidzRecord(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid tahfidz record data structure:", res.data);
        return {
          success: false,
          error: "Data catatan hafalan tidak valid",
        };
      }
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

      if (isTahfidzRecord(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid tahfidz record data structure:", res.data);
        return {
          success: false,
          error: "Data catatan hafalan tidak valid",
        };
      }
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

      if (isDeleteTahfidzResponse(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid delete response structure:", res.data);
        return {
          success: false,
          error: "Response penghapusan tidak valid",
        };
      }
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

      if (isTahfidzOverviewStats(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid tahfidz overview stats structure:", res.data);
        return {
          success: false,
          error: "Data statistik hafalan tidak valid",
        };
      }
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

      if (isSantriTahfidzStats(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid santri tahfidz stats structure:", res.data);
        return {
          success: false,
          error: "Data statistik santri tidak valid",
        };
      }
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

      if (isTahfidzRecordArray(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid recent tahfidz records structure:", res.data);
        return {
          success: false,
          error: "Data hafalan terbaru tidak valid",
        };
      }
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
