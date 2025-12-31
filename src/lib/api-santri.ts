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

// Type guard functions
function isSantri(data: unknown): data is Santri {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.gender === "string" &&
    typeof obj.birthDate === "string" &&
    (obj.address === undefined || typeof obj.address === "string") &&
    (obj.guardianId === undefined || typeof obj.guardianId === "number")
  );
}

function isSantriArray(data: unknown): data is Santri[] {
  return Array.isArray(data) && data.every(isSantri);
}

function isGuardian(data: unknown): data is Guardian {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string" &&
    obj.role === Role.GUARDIAN &&
    (obj.phone === undefined || typeof obj.phone === "string") &&
    (obj.santriAsGuardian === undefined || isSantriArray(obj.santriAsGuardian))
  );
}

function isGuardianArray(data: unknown): data is Guardian[] {
  return Array.isArray(data) && data.every(isGuardian);
}

function isMessageResponse(data: unknown): data is { message: string } {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.message === "string";
}

function isPaginatedSantri(data: unknown): data is Paginated<Santri> {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;

  // Debug: Lihat struktur response
  console.log("Checking paginated santri structure:", obj);

  // Cek apakah memiliki properti data yang berupa array santri
  if (obj.data && Array.isArray(obj.data)) {
    const dataArray = obj.data as unknown[];
    return dataArray.every(isSantri);
  }

  // Cek apakah langsung berupa array santri
  if (Array.isArray(obj)) {
    return obj.every(isSantri);
  }

  console.error("Invalid paginated santri structure:", obj);
  return false;
}

function convertToPaginatedSantri(response: unknown): Paginated<Santri> {
  console.log("Converting response to paginated format:", response);

  // Helper untuk mendapatkan data array dari berbagai format
  const getSantriArray = (data: unknown): Santri[] => {
    if (Array.isArray(data)) {
      return data.filter(isSantri);
    }

    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;

      // Coba cari properti yang berisi array santri
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          const array = obj[key] as unknown[];
          if (array.length > 0 && isSantri(array[0])) {
            return array.filter(isSantri);
          }
        }
      }
    }

    return [];
  };

  // Helper untuk mendapatkan meta dari berbagai format
  const getMeta = (
    data: unknown,
    santriArray: Santri[]
  ): Paginated<Santri>["meta"] => {
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;

      // Coba dapatkan meta dari response
      if (obj.meta && typeof obj.meta === "object") {
        const metaObj = obj.meta as Record<string, unknown>;
        return {
          total:
            typeof metaObj.total === "number"
              ? metaObj.total
              : santriArray.length,
          per_page:
            typeof metaObj.per_page === "number"
              ? metaObj.per_page
              : santriArray.length,
          current_page:
            typeof metaObj.current_page === "number" ? metaObj.current_page : 1,
          last_page:
            typeof metaObj.last_page === "number" ? metaObj.last_page : 1,
        };
      }
    }

    // Default meta
    return {
      total: santriArray.length,
      per_page: santriArray.length,
      current_page: 1,
      last_page: 1,
    };
  };

  // CASE 1: Response langsung array
  if (Array.isArray(response)) {
    const santriArray = getSantriArray(response);
    return {
      data: santriArray,
      meta: getMeta(response, santriArray),
    };
  }

  // CASE 2: Response dengan properti success dan data (NestJS format)
  if (response && typeof response === "object") {
    const responseObj = response as Record<string, unknown>;

    // Jika response dari apiFetch (NestJS format)
    if (responseObj.success === true && responseObj.data !== undefined) {
      const data = responseObj.data;
      const santriArray = getSantriArray(data);

      return {
        data: santriArray,
        meta: getMeta(responseObj, santriArray),
      };
    }

    // Jika response sudah berupa Paginated<Santri> format
    if (responseObj.data !== undefined) {
      const santriArray = getSantriArray(responseObj.data);

      return {
        data: santriArray,
        meta: getMeta(responseObj, santriArray),
      };
    }
  }

  // Fallback: return empty
  console.warn(
    "Could not convert response to paginated format, returning empty"
  );
  return {
    data: [],
    meta: {
      total: 0,
      per_page: 0,
      current_page: 1,
      last_page: 1,
    },
  };
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

      console.log("Santri API Response:", res);

      // Jika response sukses, konversi ke format Paginated<Santri>
      if (res.success && res.data) {
        return convertToPaginatedSantri(res);
      } else {
        // Jika gagal, throw error
        throw new Error(res.error || "Gagal mengambil data santri");
      }
    } catch (error) {
      console.error("Error fetching santri list:", error);
      // Return empty paginated data on error
      return {
        data: [],
        meta: {
          total: 0,
          per_page: 0,
          current_page: 1,
          last_page: 1,
        },
      };
    }
  },

  async get(id: number): Promise<ApiResponse<Santri>> {
    try {
      const res = await apiFetch(`/santri/${id}`, { method: "GET" });
      console.log("Get santri response:", res);

      if (res.success && res.data && isSantri(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid santri data structure:", res.data);
        return {
          success: false,
          error: res.error || "Data santri tidak valid",
        };
      }
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
      console.log("Create santri response:", res);

      if (res.success && res.data && isSantri(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid santri data structure:", res.data);
        return {
          success: false,
          error: res.error || "Data santri tidak valid",
        };
      }
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
      console.log("Update santri response:", res);

      if (res.success && res.data && isSantri(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid santri data structure:", res.data);
        return {
          success: false,
          error: res.error || "Data santri tidak valid",
        };
      }
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
      console.log("Delete santri response:", res);

      if (res.success && res.data && isMessageResponse(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid message response structure:", res.data);
        return {
          success: false,
          error: res.error || "Response tidak valid",
        };
      }
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
      console.log("Get guardians response:", res);

      if (res.success && res.data && isGuardianArray(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid guardians array structure:", res.data);
        return {
          success: false,
          error: res.error || "Data wali tidak valid",
        };
      }
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
