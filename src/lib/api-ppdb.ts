// lib/api-ppdb.ts
import {
  apiFetch,
  buildQueryString,
  ApiResponse,
  getToken,
  API_BASE_URL,
} from "./api-core";

export interface PpdbApplicant {
  id: number;
  name: string;
  gender: string;
  birthDate?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  email?: string;
  registrationNo?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: string;
  updatedAt: string;
  documents: PpdbDocument[];
}

export interface PpdbDocument {
  id: number;
  applicantId: number;
  fileName: string;
  filePath: string;
  createdAt: string;
}

export interface CreatePpdbDto {
  name: string;
  gender: string;
  birthDate?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  email?: string;
}

export interface UpdatePpdbStatusDto {
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

export const ppdbApi = {
  async createApplicant(
    data: CreatePpdbDto
  ): Promise<ApiResponse<PpdbApplicant>> {
    try {
      const res = await apiFetch(`/ppdb`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error creating PPDB applicant:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal membuat pendaftaran",
      };
    }
  },

  async uploadDocument(
    applicantId: number,
    file: File
  ): Promise<ApiResponse<PpdbDocument>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_BASE_URL}/ppdb/${applicantId}/document`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error("Error uploading document:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengupload dokumen",
      };
    }
  },

  async listApplicants(params?: {
    page?: number;
    per_page?: number;
    q?: string;
    status?: string;
  }): Promise<ApiResponse<PpdbApplicant[]>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/ppdb${qs}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching PPDB applicants:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data pendaftar",
      };
    }
  },

  async getApplicant(id: number): Promise<ApiResponse<PpdbApplicant>> {
    try {
      const res = await apiFetch(`/ppdb/${id}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching PPDB applicant:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data pendaftar",
      };
    }
  },

  async updateStatus(
    id: number,
    data: UpdatePpdbStatusDto
  ): Promise<ApiResponse<PpdbApplicant>> {
    try {
      const res = await apiFetch(`/ppdb/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error updating PPDB status:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengupdate status",
      };
    }
  },
};
