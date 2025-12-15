// lib/api-audit.ts
import { apiFetch, buildQueryString, ApiResponse, Paginated } from "./api-core";

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

export const auditApi = {
  async create(data: CreateAuditDto): Promise<ApiResponse<AuditTrail>> {
    try {
      const res = await apiFetch(`/audit-trail`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error creating audit log:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal membuat audit log",
      };
    }
  },

  async list(params?: {
    page?: number;
    per_page?: number;
    module?: string;
    userId?: number;
  }): Promise<ApiResponse<Paginated<AuditTrail>>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/audit-trail${qs}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil data audit",
      };
    }
  },

  async getByModule(module: string): Promise<ApiResponse<AuditTrail[]>> {
    try {
      const res = await apiFetch(`/audit-trail/module/${module}`, {
        method: "GET",
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching audit logs by module:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil data audit",
      };
    }
  },

  async logAction(params: {
    module: string;
    action: string;
    recordId?: number;
    userId?: number;
    note?: string;
  }): Promise<ApiResponse<AuditTrail>> {
    return this.create(params);
  },
};
