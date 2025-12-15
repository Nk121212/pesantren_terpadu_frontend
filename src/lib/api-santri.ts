// lib/api-santri.ts
import {
  apiFetch,
  buildQueryString,
  ApiResponse,
  Paginated,
  Role,
} from "./api-core";

export interface Santri {
  id: number;
  name: string;
  gender: "Pria" | "Wanita" | string;
  birthDate: string;
  address?: string;
  guardianId?: number;
}

export interface Guardian {
  id: number;
  name: string;
  email: string;
  role: Role.GUARDIAN;
  phone?: string;
  santriAsGuardian?: Santri[];
}

export interface SantriFormData {
  name: string;
  gender: string;
  birthDate: string;
  address: string;
  guardianId: string;
}

export const santriApi = {
  async list(params?: {
    page?: number;
    per_page?: number;
    q?: string;
  }): Promise<Paginated<Santri>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/santri${qs}`, { method: "GET" });
      return res;
    } catch (error) {
      console.error("Error fetching santri list:", error);
      throw error;
    }
  },
  async get(id: number): Promise<ApiResponse<Santri>> {
    try {
      const res = await apiFetch(`/santri/${id}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching santri:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data santri",
      };
    }
  },

  async create(payload: Partial<Santri>): Promise<ApiResponse<Santri>> {
    try {
      const res = await apiFetch(`/santri`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error creating santri:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat santri",
      };
    }
  },

  async update(
    id: number,
    payload: Partial<Santri>
  ): Promise<ApiResponse<Santri>> {
    try {
      const res = await apiFetch(`/santri/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error updating santri:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengupdate santri",
      };
    }
  },

  async remove(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await apiFetch(`/santri/${id}`, {
        method: "DELETE",
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error deleting santri:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal menghapus santri",
      };
    }
  },

  async getGuardians(): Promise<ApiResponse<Guardian[]>> {
    try {
      const res = await apiFetch(`/users?role=GUARDIAN`, {
        method: "GET",
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching guardians:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil data wali",
      };
    }
  },
};
