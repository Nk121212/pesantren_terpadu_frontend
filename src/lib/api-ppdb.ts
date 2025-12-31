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

// Type guard functions
function isPpdbDocument(data: unknown): data is PpdbDocument {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === "number" &&
    typeof obj.applicantId === "number" &&
    typeof obj.fileName === "string" &&
    typeof obj.filePath === "string" &&
    typeof obj.createdAt === "string"
  );
}

function isPpdbDocumentArray(data: unknown): data is PpdbDocument[] {
  return Array.isArray(data) && data.every(isPpdbDocument);
}

function isPpdbApplicant(data: unknown): data is PpdbApplicant {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  const validStatuses = ["PENDING", "ACCEPTED", "REJECTED"] as const;
  const validPaymentStatuses = ["PENDING", "SUCCESS", "FAILED"] as const;

  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.gender === "string" &&
    typeof obj.createdAt === "string" &&
    typeof obj.updatedAt === "string" &&
    validStatuses.includes(obj.status as "PENDING" | "ACCEPTED" | "REJECTED") &&
    validPaymentStatuses.includes(
      obj.paymentStatus as "PENDING" | "SUCCESS" | "FAILED"
    ) &&
    (obj.birthDate === undefined || typeof obj.birthDate === "string") &&
    (obj.address === undefined || typeof obj.address === "string") &&
    (obj.guardianName === undefined || typeof obj.guardianName === "string") &&
    (obj.guardianPhone === undefined ||
      typeof obj.guardianPhone === "string") &&
    (obj.email === undefined || typeof obj.email === "string") &&
    (obj.registrationNo === undefined ||
      typeof obj.registrationNo === "string") &&
    (obj.documents === undefined || isPpdbDocumentArray(obj.documents))
  );
}

function isPpdbApplicantArray(data: unknown): data is PpdbApplicant[] {
  return Array.isArray(data) && data.every(isPpdbApplicant);
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

      if (isPpdbApplicant(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid PPDB applicant data structure:", res.data);
        return {
          success: false,
          error: "Data pendaftar PPDB tidak valid",
        };
      }
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

      if (isPpdbDocument(result)) {
        return { success: true, data: result };
      } else {
        console.error("Invalid PPDB document data structure:", result);
        return {
          success: false,
          error: "Data dokumen PPDB tidak valid",
        };
      }
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

      if (isPpdbApplicantArray(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid PPDB applicants array structure:", res.data);
        return {
          success: false,
          error: "Data pendaftar PPDB array tidak valid",
        };
      }
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

      if (isPpdbApplicant(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid PPDB applicant data structure:", res.data);
        return {
          success: false,
          error: "Data pendaftar PPDB tidak valid",
        };
      }
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

      if (isPpdbApplicant(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid PPDB applicant data structure:", res.data);
        return {
          success: false,
          error: "Data pendaftar PPDB tidak valid",
        };
      }
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
