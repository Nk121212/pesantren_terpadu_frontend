// lib/api-audit.ts
import { apiFetch, buildQueryString, ApiResponse, Paginated } from "./api-core";

/* =======================
 * TYPES
 * ======================= */
export interface AuditTrail {
  id: number;
  module: string;
  action: string;
  recordId?: number | null;
  userId?: number | null;
  note?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
}

export interface CreateAuditDto {
  module: string;
  action: string;
  recordId?: number;
  userId?: number;
  note?: string;
}

/* =======================
 * TYPE GUARDS
 * ======================= */
function isAuditTrail(data: unknown): data is AuditTrail {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === "number" &&
    typeof obj.module === "string" &&
    typeof obj.action === "string"
  );
}

function isAuditTrailArray(data: unknown): data is AuditTrail[] {
  return Array.isArray(data) && data.every(isAuditTrail);
}

function isPaginatedAuditTrail(data: unknown): data is Paginated<AuditTrail> {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.data)) return false;
  if (!obj.meta || typeof obj.meta !== "object") return false;

  return obj.data.every(isAuditTrail);
}

/* =======================
 * API
 * ======================= */
export const auditApi = {
  /* CREATE */
  async create(data: CreateAuditDto): Promise<ApiResponse<AuditTrail>> {
    try {
      const res = await apiFetch(`/audit-trail`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (isAuditTrail(res.data)) {
        return { success: true, data: res.data };
      }

      console.error("Invalid audit trail data:", res.data);
      return {
        success: false,
        error: "Data audit trail tidak valid",
      };
    } catch (error) {
      console.error("Error creating audit log:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal membuat audit log",
      };
    }
  },

  /* LIST (ARRAY / PAGINATED SAFE) */
  async list(params?: {
    page?: number;
    per_page?: number;
    module?: string;
    userId?: number;
  }): Promise<ApiResponse<AuditTrail[]>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/audit-trail${qs}`, {
        method: "GET",
      });

      // ✅ CASE 1: Backend return ARRAY
      if (isAuditTrailArray(res.data)) {
        return {
          success: true,
          data: res.data,
        };
      }

      // ✅ CASE 2: Backend return PAGINATED
      if (isPaginatedAuditTrail(res.data)) {
        return {
          success: true,
          data: res.data.data,
        };
      }

      console.error("Invalid audit trail structure:", res.data);
      return {
        success: false,
        error: "Struktur data audit trail tidak valid",
      };
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil data audit",
      };
    }
  },

  /* FILTER BY MODULE */
  async getByModule(module: string): Promise<ApiResponse<AuditTrail[]>> {
    try {
      const res = await apiFetch(`/audit-trail/module/${module}`, {
        method: "GET",
      });

      if (isAuditTrailArray(res.data)) {
        return { success: true, data: res.data };
      }

      console.error("Invalid audit trail array:", res.data);
      return {
        success: false,
        error: "Data audit trail array tidak valid",
      };
    } catch (error) {
      console.error("Error fetching audit logs by module:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil data audit",
      };
    }
  },

  /* ALIAS */
  async logAction(params: CreateAuditDto) {
    return this.create(params);
  },
};
