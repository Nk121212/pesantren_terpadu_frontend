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
  counselorId?: number | null;
  topic: string;
  notes?: string;
  recommendation?: string;
  status: CounselingStatus;
  scheduledAt: string;
  createdAt: string;
  updatedAt: string;

  santri?: {
    id: number;
    name: string;
    gender?: string;
  };

  counselor?: {
    id: number;
    name: string;
    email?: string;
  } | null;
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

function isCounselingSession(data: unknown): data is CounselingSession {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === "number" &&
    typeof obj.santriId === "number" &&
    typeof obj.topic === "string" &&
    typeof obj.status === "string" &&
    typeof obj.scheduledAt === "string"
  );
}

function isCounselingSessionArray(data: unknown): data is CounselingSession[] {
  return Array.isArray(data) && data.every(isCounselingSession);
}

function isCounselingStats(data: unknown): data is {
  totalSessions: number;
  totalPlanned: number;
  totalOngoing: number;
  totalCompleted: number;
  totalCancelled: number;
} {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.totalSessions === "number" &&
    typeof obj.totalPlanned === "number" &&
    typeof obj.totalOngoing === "number" &&
    typeof obj.totalCompleted === "number" &&
    typeof obj.totalCancelled === "number"
  );
}

function isCounselor(data: unknown): data is Counselor {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string" &&
    (obj.role === undefined || typeof obj.role === "string")
  );
}

function isCounselorArray(data: unknown): data is Counselor[] {
  return Array.isArray(data) && data.every(isCounselor);
}

export interface Counselor {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export const counselingApi = {
  async getStats(): Promise<
    ApiResponse<{
      totalSessions: number;
      ongoing: number;
      done: number;
    }>
  > {
    try {
      const res = await apiFetch(`/counseling/stats`, { method: "GET" });

      const raw = (res.data ?? {}) as Record<string, unknown>;

      const normalized = {
        totalSessions: Number(raw.totalSessions ?? raw.total_sessions ?? 0),
        ongoing: Number(raw.ongoing ?? 0),
        done: Number(raw.done ?? 0),
      };

      return {
        success: true,
        data: normalized,
      };
    } catch (error) {
      console.error("Error fetching counseling stats:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil statistik konseling",
      };
    }
  },

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

      if (isCounselingSession(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid counseling session data structure:", res.data);
        return {
          success: false,
          error: "Data sesi konseling tidak valid",
        };
      }
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

      if (isCounselingSessionArray(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid counseling sessions array structure:", res.data);
        return {
          success: false,
          error: "Data sesi konseling array tidak valid",
        };
      }
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

      if (isCounselingSession(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid counseling session data structure:", res.data);
        return {
          success: false,
          error: "Data sesi konseling tidak valid",
        };
      }
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

      if (isCounselingSession(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid counseling session data structure:", res.data);
        return {
          success: false,
          error: "Data sesi konseling tidak valid",
        };
      }
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

export const counselorsApi = {
  async list(): Promise<ApiResponse<CounselingSession[]>> {
    try {
      const res = await apiFetch(`/counseling`, { method: "GET" });

      let dataToCheck: unknown = res.data;

      /**
       * Handle kemungkinan response:
       * 1. { success, data: CounselingSession[] }
       * 2. { success, data: { success, data: CounselingSession[] } }
       */
      if (res && typeof res === "object" && "success" in res) {
        const r = res as { success: boolean; data?: unknown };

        if (Array.isArray(r.data)) {
          dataToCheck = r.data;
        } else if (
          r.data &&
          typeof r.data === "object" &&
          "data" in (r.data as Record<string, unknown>)
        ) {
          dataToCheck = (r.data as Record<string, unknown>).data;
        }
      }

      if (isCounselingSessionArray(dataToCheck)) {
        return { success: true, data: dataToCheck };
      }

      console.error("Invalid counseling sessions array structure:", res.data);
      return {
        success: false,
        error: "Data sesi konseling array tidak valid",
      };
    } catch (error) {
      console.error("Error fetching counseling sessions:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data konseling",
      };
    }
  },
};
