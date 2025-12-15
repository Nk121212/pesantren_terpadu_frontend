export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Paginated<T> {
  data: T[];
  meta?: {
    total?: number;
    per_page?: number;
    current_page?: number;
    last_page?: number;
  };
}

export enum Role {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  GUARDIAN = "GUARDIAN",
  MERCHANT = "MERCHANT",
  STAFF = "STAFF",
}

// Token management
export const getToken = (): string => {
  if (typeof window === "undefined") return "";

  try {
    const token = localStorage.getItem("token");
    return token || "";
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return "";
  }
};

// Core fetch function
export async function apiFetch(path: string, options: RequestInit = {}) {
  const hasLocalStorage =
    typeof globalThis !== "undefined" && "localStorage" in globalThis;

  const token = hasLocalStorage
    ? globalThis.localStorage.getItem("token")
    : null;

  const extraHeaders =
    options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options.headers as Record<string, string>) ?? {};

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };

  if (isFormData && "Content-Type" in headers) {
    delete (headers as Record<string, unknown>)["Content-Type"];
  }

  const url = `${API_BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let responseText = "";
    let payload = null;

    try {
      responseText = await res.text();

      if (responseText && responseText.trim() !== "") {
        payload = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.warn(`⚠️ Failed to parse JSON response:`, parseError);
      console.warn(`📄 Response text that failed to parse:`, responseText);
      // Continue with payload as null
    }

    if (!res.ok) {
      // Handle 401 Unauthorized
      if (res.status === 401 && hasLocalStorage) {
        globalThis.localStorage.removeItem("token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Unauthorized - Please login again");
      }

      // Build error message
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;

      if (payload) {
        if (typeof payload.message === "string") {
          errorMessage = payload.message;
        } else if (Array.isArray(payload.message)) {
          errorMessage = payload.message
            .map((err: unknown) => {
              if (typeof err === "string") return err;
              if (typeof err === "object" && err !== null && "message" in err) {
                return String((err as { message: string }).message);
              }
              return JSON.stringify(err);
            })
            .join("; ");
        } else if (typeof payload.error === "string") {
          errorMessage = payload.error;
        }
      } else if (responseText) {
        errorMessage = `Server response: ${responseText}`;
      }

      console.error(`❌ API Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Return the payload for successful responses
    return payload;
  } catch (error) {
    console.error(`💥 API Fetch Error:`, error);

    // Re-throw the error so calling code can handle it
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(`Unknown error: ${String(error)}`);
  }
}

// Utility functions
export function buildQueryString<T extends Record<string, unknown>>(
  obj?: T
): string {
  if (!obj) return "";

  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        // Handle array values
        value.forEach((item) => {
          params.append(key, String(item));
        });
      } else if (typeof value === "object") {
        // Handle nested objects by stringifying
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, String(value));
      }
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
    window.location.href = "/login";
  }
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
