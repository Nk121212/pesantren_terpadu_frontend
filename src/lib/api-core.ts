export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/* =======================
   COMMON TYPES
======================= */

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

export enum Role {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  GUARDIAN = "GUARDIAN",
  MERCHANT = "MERCHANT",
  STAFF = "STAFF",
}

/* =======================
   TOKEN HANDLING
======================= */

export const getToken = (): string => {
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem("token") || "";
  } catch {
    return "";
  }
};

export function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");

  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }

  window.location.replace("/login");
}

/* =======================
   CORE FETCH
======================= */

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const isBrowser = typeof window !== "undefined" && "localStorage" in window;
  const token = isBrowser ? localStorage.getItem("token") : null;

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

  const url = `${API_BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const payload = await res.json();

    /* =======================
       401 UNAUTHORIZED
    ======================= */
    if (res.status === 401 && isBrowser) {
      logout();
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (!res.ok) {
      throw new Error(payload?.message || payload?.error || res.statusText);
    }

    return payload as ApiResponse<T>;
  } catch (error) {
    console.error("💥 API Fetch Error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown API error",
    };
  }
}

/* =======================
   QUERY STRING BUILDER
======================= */

export function buildQueryString<T extends Record<string, unknown>>(
  obj?: T
): string {
  if (!obj) return "";

  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, String(item)));
      } else if (typeof value === "object") {
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, String(value));
      }
    }
  });

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
