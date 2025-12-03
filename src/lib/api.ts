export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

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

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
    window.location.href = "/login";
  }
}

export interface Santri {
  id: number;
  name: string;
  gender: "Pria" | "Wanita" | string;
  birthDate: string;
  address?: string;
  guardianId?: number;
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

export const dashboardApi = {
  async getSummary() {
    return await apiFetch("/reporting/dashboard-summary", {
      method: "GET",
    });
  },
};

function buildQueryString(obj?: Record<string, unknown>) {
  if (!obj) return "";
  const q = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(
          typeof v === "object" ? JSON.stringify(v) : String(v)
        )}`
    )
    .join("&");
  return q ? `?${q}` : "";
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
  async list(params?: { page?: number; per_page?: number; q?: string }) {
    const qs = buildQueryString(params);
    const res = await apiFetch(`/santri${qs}`, { method: "GET" });
    return res as Paginated<Santri> | { data: Santri[] };
  },

  async get(id: number) {
    const res = await apiFetch(`/santri/${id}`, { method: "GET" });
    return res as { data: Santri };
  },

  async create(payload: Partial<Santri>) {
    const res = await apiFetch(`/santri`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async update(id: number, payload: Partial<Santri>) {
    const res = await apiFetch(`/santri/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async remove(id: number) {
    const res = await apiFetch(`/santri/${id}`, {
      method: "DELETE",
    });
    return res;
  },

  async getGuardians() {
    return await apiFetch(`/users?role=GUARDIAN`, {
      method: "GET",
    });
  },
};

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  proofUrl?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  invoice?: Invoice;
}

export interface Invoice {
  id: number;
  santriId: number;
  santriName?: string;
  amount: number;
  description: string;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
  santri?: Santri;
  payments?: Payment[];
}

export interface CreatePaymentDto {
  invoiceId: number;
  amount: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  proofUrl?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  proofUrl?: string;
}

export interface CreateRecurringInvoiceDto {
  santriId: number;
  amount: number;
  description: string;
  dueDate?: string;
  method?: PaymentMethod;
}

export interface DuitkuPaymentResponse {
  paymentUrl: string;
  reference: string;
}

export enum PaymentMethod {
  BANK_TRANSFER = "BANK_TRANSFER",
  VA = "VA",
  QRIS = "QRIS",
  EWALLET = "EWALLET",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum InvoiceStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export const paymentsApi = {
  async create(
    payload: CreatePaymentDto
  ): Promise<{ success: boolean; data: Payment; message: string }> {
    const res = await apiFetch(`/payments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async get(
    id: number
  ): Promise<{ success: boolean; data: Payment; message: string }> {
    const res = await apiFetch(`/payments/${id}`, {
      method: "GET",
    });
    return res;
  },

  async getByInvoice(
    invoiceId: number
  ): Promise<{ success: boolean; data: Payment[]; message: string }> {
    const res = await apiFetch(`/payments/invoice/${invoiceId}`, {
      method: "GET",
    });
    return res;
  },

  async update(
    id: number,
    payload: UpdatePaymentDto
  ): Promise<{ success: boolean; data: Payment; message: string }> {
    const res = await apiFetch(`/payments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch(`/payments/${id}`, {
      method: "DELETE",
    });
    return res;
  },

  async createDuitkuPayment(
    invoiceId: number,
    method: PaymentMethod,
    amount: number
  ): Promise<{
    success: boolean;
    data: DuitkuPaymentResponse;
    message: string;
  }> {
    const res = await apiFetch(`/payments/duitku/${invoiceId}/${method}`, {
      method: "POST",
      body: JSON.stringify(amount),
    });
    return res;
  },

  async createRecurringInvoice(
    payload: CreateRecurringInvoiceDto
  ): Promise<{ success: boolean; data: Invoice; message: string }> {
    const res = await apiFetch(`/payments/recurring`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async simulateWebhook(
    payload: unknown
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch(`/payments/webhook`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },
};

export const invoicesApi = {
  async list(params?: {
    page?: number;
    per_page?: number;
    santriId?: number;
  }): Promise<Paginated<Invoice>> {
    const qs = buildQueryString(params);
    const res = await apiFetch(`/invoices${qs}`, {
      method: "GET",
    });
    return res;
  },

  async get(
    id: number
  ): Promise<{ success: boolean; data: Invoice; message: string }> {
    const res = await apiFetch(`/invoices/${id}`, {
      method: "GET",
    });
    return res;
  },

  async create(payload: {
    santriId: number;
    amount: number;
    description: string;
    dueDate?: string;
  }): Promise<{ success: boolean; data: Invoice; message: string }> {
    const res = await apiFetch(`/invoices`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },
};

export interface Savings {
  id: number;
  santriId: number;
  santriName?: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
  santri?: {
    id: number;
    name: string;
    gender: string;
    birthDate: string;
    address?: string;
    guardianId?: number;
    createdAt: string;
    updatedAt: string;
  };
  transactions?: SavingsTransaction[];
}

export const parseBalance = (balance: string | number): number => {
  if (typeof balance === "number") return balance;
  return parseFloat(balance) || 0;
};

export interface SavingsBalance {
  santriId: number;
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface SavingsTransaction {
  id: number;
  savingsId: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string;
  proofUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdBy: number;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsRequest {
  santriId: number;
}

export interface CreateTransactionRequest {
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string;
  proof?: File;
}

export interface ApproveTransactionRequest {
  approve: boolean;
}

export const tabunganApi = {
  async create(data: CreateSavingsRequest): Promise<ApiResponse<Savings>> {
    try {
      const res = await apiFetch(`/savings`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: res };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Failed to create savings account",
        };
      }
      return {
        success: false,
        error: "Failed to create savings account",
      };
    }
  },

  async list(): Promise<ApiResponse<Savings[]>> {
    try {
      const res = await apiFetch(`/savings`, { method: "GET" });

      let data = res;
      if (res && typeof res === "object" && "data" in res) {
        data = res.data;
      }

      if (Array.isArray(data)) {
        return { success: true, data };
      } else {
        return {
          success: false,
          error: "Invalid data format: expected array",
        };
      }
    } catch (error) {
      console.error("Error in savings list:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Failed to fetch savings list",
        };
      }
      return {
        success: false,
        error: "Failed to fetch savings list",
      };
    }
  },

  async getById(id: number): Promise<ApiResponse<Savings>> {
    try {
      const response = await fetch(`${API_BASE_URL}/savings/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: "Savings account not found",
          };
        }
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || `Error: ${response.status}`,
        };
      }

      const resultData = await response.json();

      if (resultData.success && resultData.data) {
        return {
          success: true,
          data: resultData.data,
        };
      } else {
        return {
          success: true,
          data: resultData,
        };
      }
    } catch (error) {
      console.error("Error in get savings by ID:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Failed to fetch savings",
        };
      }
      return {
        success: false,
        error: "Failed to fetch savings",
      };
    }
  },

  async getBalance(santriId: number): Promise<ApiResponse<SavingsBalance>> {
    try {
      const res = await apiFetch(`/savings/balance/${santriId}`, {
        method: "GET",
      });
      return { success: true, data: res };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Failed to fetch balance",
        };
      }
      return {
        success: false,
        error: "Failed to fetch balance",
      };
    }
  },

  async createTransaction(
    savingsId: number,
    data: CreateTransactionRequest
  ): Promise<ApiResponse<SavingsTransaction>> {
    try {
      const payload: unknown = {
        type: data.type,
        amount: Number(data.amount),
        description: data.description || "",
      };

      const res = await apiFetch(`/savings/transaction/${savingsId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return { success: true, data: res };
    } catch (error) {
      console.error("Error in create transaction:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Failed to create transaction",
        };
      }
      return {
        success: false,
        error: "Failed to create transaction",
      };
    }
  },

  async listTransactions(
    savingsId: number
  ): Promise<ApiResponse<SavingsTransaction[]>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/savings/transaction/${savingsId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || `Error: ${response.status}`,
        };
      }

      const resultData = await response.json();

      if (resultData.success && Array.isArray(resultData.data)) {
        return {
          success: true,
          data: resultData.data,
        };
      } else if (Array.isArray(resultData)) {
        return {
          success: true,
          data: resultData,
        };
      } else {
        return {
          success: false,
          error: "Invalid data format: expected array",
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Failed to fetch transactions",
        };
      }
      return {
        success: false,
        error: "Failed to fetch transactions",
      };
    }
  },

  async approveTransaction(
    transactionId: number,
    data: ApproveTransactionRequest
  ): Promise<ApiResponse<SavingsTransaction>> {
    try {
      const res = await apiFetch(
        `/savings/transaction/${transactionId}/approve`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
      return { success: true, data: res };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Failed to approve transaction",
        };
      }
      return {
        success: false,
        error: "Failed to approve transaction",
      };
    }
  },

  async getAllBalances(): Promise<ApiResponse<SavingsBalance[]>> {
    try {
      const savingsRes = await this.list();

      if (!savingsRes.success || !Array.isArray(savingsRes.data)) {
        return {
          success: false,
          error: "Failed to fetch savings data",
        };
      }

      if (savingsRes.data.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      const balances: SavingsBalance[] = savingsRes.data.map((saving) => {
        const balance = parseBalance(saving.balance);
        return {
          santriId: saving.santriId,
          balance: balance,
          totalIncome: balance > 0 ? balance : 0,
          totalExpense: 0,
        };
      });

      return {
        success: true,
        data: balances,
      };
    } catch (error) {
      console.error("Error in getAllBalances:", error);
      return {
        success: false,
        error: "Failed to fetch balances",
      };
    }
  },
};

// ================================
// PPDB TYPES & API
// ================================

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
      return { success: true, data: res };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Gagal membuat pendaftaran",
        };
      }
      return {
        success: false,
        error: "Gagal membuat pendaftaran",
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
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || `Error: ${response.status}`,
        };
      }

      const resultData = await response.json();

      if (resultData.success && resultData.data) {
        return {
          success: true,
          data: resultData.data,
        };
      } else {
        return {
          success: true,
          data: resultData,
        };
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Gagal mengupload dokumen",
        };
      }
      return {
        success: false,
        error: "Gagal mengupload dokumen",
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
      const res = await apiFetch(`/ppdb${qs}`, {
        method: "GET",
      });

      let data = res;
      if (res && typeof res === "object" && "data" in res) {
        data = res.data;
      }

      if (Array.isArray(data)) {
        return { success: true, data };
      } else {
        return {
          success: false,
          error: "Invalid data format: expected array",
        };
      }
    } catch (error) {
      console.error("Error in ppdb list:", error);
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Gagal mengambil data pendaftar",
        };
      }
      return {
        success: false,
        error: "Gagal mengambil data pendaftar",
      };
    }
  },

  async getApplicant(id: number): Promise<ApiResponse<PpdbApplicant>> {
    try {
      const res = await apiFetch(`/ppdb/${id}`, {
        method: "GET",
      });

      let data = res;
      if (res && typeof res === "object" && "data" in res) {
        data = res.data;
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error getting applicant:", error);
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Gagal mengambil data pendaftar",
        };
      }
      return {
        success: false,
        error: "Gagal mengambil data pendaftar",
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
      return { success: true, data: res };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Gagal mengupdate status",
        };
      }
      return {
        success: false,
        error: "Gagal mengupdate status",
      };
    }
  },
};

// ================================
// CANTEEN TYPES & API
// ================================

export interface Merchant {
  id: number;
  userId: number;
  name: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface CanteenTransaction {
  id: number;
  santriId: number;
  merchantId: number;
  amount: number;
  description?: string;
  paymentMethod: "QRIS" | "VA" | "EWALLET" | "BANK_TRANSFER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  proofUrl?: string;
  createdAt: string;
  santri?: {
    id: number;
    name: string;
  };
  merchant?: {
    id: number;
    name: string;
  };
  savingsTransaction?: {
    id: number;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description?: string;
  };
}

export interface CreateMerchantDto {
  userId: number;
  name: string;
}

export interface CreateCanteenTxDto {
  santriId: number;
  merchantId: number;
  amount: number;
  description?: string;
  paymentMethod?: "QRIS" | "VA" | "EWALLET" | "BANK_TRANSFER";
  proofUrl?: string;
  createdBy?: number;
}

export const canteenApi = {
  // Merchant Management
  async createMerchant(
    data: CreateMerchantDto
  ): Promise<ApiResponse<Merchant>> {
    try {
      console.log("Creating merchant with data:", data);

      const response = await fetch(`${API_BASE_URL}/canteen/merchant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Create merchant response:", result);

      // Handle the correct response format
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      } else {
        throw new Error(result.message || "Invalid response format");
      }
    } catch (error) {
      console.error("Error in createMerchant:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Gagal membuat merchant",
        };
      }
      return {
        success: false,
        error: "Gagal membuat merchant",
      };
    }
  },

  async getMerchant(id: number): Promise<ApiResponse<Merchant>> {
    try {
      console.log(`Fetching merchant with ID: ${id}`);

      const response = await fetch(`${API_BASE_URL}/canteen/merchant/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Raw merchant response:", result);

      // Handle the correct response format
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      } else {
        throw new Error(result.message || "Invalid response format");
      }
    } catch (error) {
      console.error("Error in getMerchant:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Gagal mengambil data merchant",
        };
      }
      return {
        success: false,
        error: "Gagal mengambil data merchant",
      };
    }
  },

  async listMerchants(params?: {
    skip?: number;
    take?: number;
  }): Promise<ApiResponse<Merchant[]>> {
    try {
      const qs = buildQueryString(params);
      const response = await fetch(`${API_BASE_URL}/canteen/merchant${qs}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Raw merchants list response:", result);

      // Handle the correct response format
      if (result.success && result.data) {
        return {
          success: true,
          data: Array.isArray(result.data) ? result.data : [],
        };
      } else {
        throw new Error(result.message || "Invalid response format");
      }
    } catch (error) {
      console.error("Error in merchants list:", error);
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Gagal mengambil data merchants",
        };
      }
      return {
        success: false,
        error: "Gagal mengambil data merchants",
      };
    }
  },

  // Canteen Transactions
  async createTransaction(
    data: CreateCanteenTxDto,
    file?: File
  ): Promise<ApiResponse<CanteenTransaction>> {
    try {
      if (file) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("santriId", data.santriId.toString());
        formData.append("merchantId", data.merchantId.toString());
        formData.append("amount", data.amount.toString());

        if (data.description) {
          formData.append("description", data.description);
        }
        if (data.paymentMethod) {
          formData.append("paymentMethod", data.paymentMethod);
        }
        if (data.createdBy) {
          formData.append("createdBy", data.createdBy.toString());
        }

        formData.append("proof", file);

        const response = await fetch(`${API_BASE_URL}/canteen/transaction`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.message || `Error: ${response.status}`,
          };
        }

        const resultData = await response.json();
        return { success: true, data: resultData };
      } else {
        // Use JSON without file
        const res = await apiFetch(`/canteen/transaction`, {
          method: "POST",
          body: JSON.stringify(data),
        });
        return { success: true, data: res };
      }
    } catch (error) {
      console.error("Error in create transaction:", error);
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Gagal membuat transaksi",
        };
      }
      return {
        success: false,
        error: "Gagal membuat transaksi",
      };
    }
  },

  async listTransactions(
    merchantId: number
  ): Promise<ApiResponse<CanteenTransaction[]>> {
    try {
      console.log(`Fetching transactions for merchant ID: ${merchantId}`);

      const response = await fetch(
        `${API_BASE_URL}/canteen/transactions/${merchantId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Raw transactions response:", result);

      // Handle the correct response format
      if (result.success && result.data) {
        return {
          success: true,
          data: Array.isArray(result.data) ? result.data : [],
        };
      } else {
        throw new Error(result.message || "Invalid response format");
      }
    } catch (error) {
      console.error("Error in listTransactions:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Gagal mengambil data transaksi",
        };
      }
      return {
        success: false,
        error: "Gagal mengambil data transaksi",
      };
    }
  },
};

// Di file api.ts, tambahkan interface dan API untuk Audit Trail

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

// Tambahkan ke API functions
export const auditApi = {
  // Buat audit log baru
  async create(payload: CreateAuditDto) {
    const res = await apiFetch(`/audit-trail`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  // Dapatkan semua audit log
  async list(params?: {
    page?: number;
    per_page?: number;
    module?: string;
    userId?: number;
  }) {
    const qs = buildQueryString(params);
    const res = await apiFetch(`/audit-trail${qs}`, {
      method: "GET",
    });
    return res as Paginated<AuditTrail> | { data: AuditTrail[] };
  },

  // Dapatkan audit log by module
  async getByModule(module: string) {
    const res = await apiFetch(`/audit-trail/module/${module}`, {
      method: "GET",
    });
    return res as AuditTrail[];
  },

  // Utility function untuk log action
  async logAction(params: {
    module: string;
    action: string;
    recordId?: number;
    userId?: number;
    note?: string;
  }) {
    return this.create(params);
  },
};

// Tambahkan interface untuk Academic Module di api.ts

// Academic Subject
export interface AcademicSubject {
  id: number;
  name: string;
  description?: string;
  teacherId?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
}

// Academic Grade
export interface AcademicGrade {
  id: number;
  santriId: number;
  subjectId: number;
  score: number;
  remarks?: string;
  semester: number;
  year: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  santri?: {
    id: number;
    name: string;
  };
  subject?: {
    id: number;
    name: string;
  };
}

// Attendance
export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  SICK = "SICK",
  PERMIT = "PERMIT", // Ganti PERMIT dengan PERMITTED
}

export interface Attendance {
  id: number;
  santriId: number;
  date: string | Date;
  status: AttendanceStatus; // Gunakan enum di sini
  remarks?: string;
  recordedBy?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  santri?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    name: string;
  };
}

// DTO untuk Create/Update
export interface CreateSubjectDto {
  name: string;
  description?: string;
  teacherId?: number;
}

export interface CreateGradeDto {
  santriId: number;
  subjectId: number;
  score: number;
  remarks?: string;
  semester: number;
  year: number;
}

export interface CreateAttendanceDto {
  santriId: number;
  date: string;
  status: AttendanceStatus; // Gunakan enum di sini
  remarks?: string;
  recordedBy?: number;
}

export interface LogActionResponse {
  success: boolean;
  data?: {
    id?: number;
    module?: string;
    action?: string;
    [key: string]: unknown;
  };
  error?: string;
}

// Tambahkan API functions untuk Academic Module
export const academicApi = {
  // academicApi object di api.ts

  async logAction(params: {
    module: string;
    action: string;
    recordId?: number;
    userId?: number;
    note?: string;
  }): Promise<LogActionResponse> {
    try {
      // Coba gunakan auditApi jika tersedia
      if (auditApi && typeof auditApi.create === "function") {
        // Buat payload yang sesuai dengan DTO backend
        const auditPayload: any = {
          module: params.module,
          action: params.action,
        };

        // Hanya tambahkan properti jika ada nilainya
        if (params.recordId !== undefined) {
          auditPayload.recordId = params.recordId;
        }

        if (params.userId !== undefined) {
          auditPayload.userId = params.userId;
        }

        if (params.note) {
          auditPayload.note = params.note;
        }

        const auditResult = await auditApi.create(auditPayload);

        // Handle different response formats
        if (auditResult && typeof auditResult === "object") {
          if ("success" in auditResult && auditResult.success) {
            return {
              success: true,
              data: auditResult.data || params,
            };
          } else if ("id" in auditResult) {
            return {
              success: true,
              data: auditResult,
            };
          }
        }

        return {
          success: true,
          data: auditResult || params,
        };
      }

      // Fallback: log ke console jika auditApi tidak tersedia
      console.log("Audit Log:", params);
      return {
        success: true,
        data: params,
      };
    } catch (error) {
      console.error("Failed to log action:", error);
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || "Failed to log audit action",
        };
      }
      return {
        success: false,
        error: "Failed to log audit action",
      };
    }
  },

  async createGrade(payload: CreateGradeDto) {
    try {
      console.log("Creating grade with payload:", payload);

      // Pastikan tipe data sesuai dengan DTO
      const cleanPayload = {
        santriId: Number(payload.santriId),
        subjectId: Number(payload.subjectId),
        score: Number(payload.score),
        remarks: payload.remarks || undefined,
        semester: Number(payload.semester),
        year: Number(payload.year),
      };

      console.log("Clean payload:", cleanPayload);

      const response = await fetch(`${API_BASE_URL}/academic/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(cleanPayload),
      });

      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Keep original error message
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }

      console.log("Parsed result:", result);

      // Handle different response formats
      if (result.success && result.data) {
        return result.data;
      } else if (result.id) {
        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error("Error creating grade:", error);
      throw error;
    }
  },
  async listAttendance(params?: {
    skip?: number;
    take?: number;
    santriId?: number;
    date?: string;
    status?: AttendanceStatus;
  }) {
    const qs = buildQueryString(params);
    const res = await apiFetch(`/academic/attendance${qs}`, {
      method: "GET",
    });
    return res as Attendance[] | { data: Attendance[] };
  },
  async listGrades(params?: {
    skip?: number;
    take?: number;
    santriId?: string | number;
    subjectId?: string | number;
    semester?: string | number;
    year?: string | number;
  }) {
    try {
      const queryParams = new URLSearchParams();

      if (params?.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params?.take !== undefined)
        queryParams.append("take", params.take.toString());
      if (params?.santriId)
        queryParams.append("santriId", params.santriId.toString());
      if (params?.subjectId)
        queryParams.append("subjectId", params.subjectId.toString());
      if (params?.semester)
        queryParams.append("semester", params.semester.toString());
      if (params?.year) queryParams.append("year", params.year.toString());

      const queryString = queryParams.toString();
      const url = `/academic/grade${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching grades:", error);
      throw error;
    }
  },
  async createSubject(payload: CreateSubjectDto) {
    const res = await apiFetch(`/academic/subject`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async listSubjects(params?: {
    skip?: number;
    take?: number;
    teacherId?: number;
  }) {
    const qs = buildQueryString(params);
    const res = await apiFetch(`/academic/subject${qs}`, {
      method: "GET",
    });
    return res as AcademicSubject[] | { data: AcademicSubject[] };
  },

  async getSubject(id: number) {
    const res = await apiFetch(`/academic/subject/${id}`, {
      method: "GET",
    });
    return res as AcademicSubject;
  },

  async updateSubject(id: number, payload: Partial<CreateSubjectDto>) {
    const res = await apiFetch(`/academic/subject/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async deleteSubject(id: number) {
    const res = await apiFetch(`/academic/subject/${id}`, {
      method: "DELETE",
    });
    return res;
  },

  async getGradesBySantri(santriId: number) {
    const res = await apiFetch(`/academic/grades/santri/${santriId}`, {
      method: "GET",
    });
    return res as AcademicGrade[] | { data: AcademicGrade[] };
  },

  async getGrade(id: number) {
    const res = await apiFetch(`/academic/grade/${id}`, {
      method: "GET",
    });
    return res as AcademicGrade;
  },

  async updateGrade(id: number, payload: Partial<CreateGradeDto>) {
    const res = await apiFetch(`/academic/grade/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async deleteGrade(id: number) {
    const res = await apiFetch(`/academic/grade/${id}`, {
      method: "DELETE",
    });
    return res;
  },

  // Attendance
  async createAttendance(payload: CreateAttendanceDto) {
    const res = await apiFetch(`/academic/attendance`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async getAttendanceBySantri(santriId: number) {
    const res = await apiFetch(`/academic/attendance/santri/${santriId}`, {
      method: "GET",
    });
    return res as Attendance[] | { data: Attendance[] };
  },

  async getAttendance(id: number) {
    const res = await apiFetch(`/academic/attendance/${id}`, {
      method: "GET",
    });
    return res as Attendance;
  },

  async updateAttendance(id: number, payload: Partial<CreateAttendanceDto>) {
    const res = await apiFetch(`/academic/attendance/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async deleteAttendance(id: number) {
    const res = await apiFetch(`/academic/attendance/${id}`, {
      method: "DELETE",
    });
    return res;
  },

  // Stats
  async getStats() {
    const res = await apiFetch(`/academic/stats`, {
      method: "GET",
    });
    return res as {
      totalSubjects: number;
      totalGrades: number;
      totalAttendance: number;
      averageScore: number;
    };
  },

  // Bulk operations
  async bulkCreateGrades(payloads: CreateGradeDto[]) {
    const res = await apiFetch(`/academic/grade/bulk`, {
      method: "POST",
      body: JSON.stringify(payloads),
    });
    return res;
  },

  async bulkCreateAttendance(payloads: CreateAttendanceDto[]) {
    const res = await apiFetch(`/academic/attendance/bulk`, {
      method: "POST",
      body: JSON.stringify(payloads),
    });
    return res;
  },
};

// Tambahkan interface yang hilang di bagian Academic Module
export interface CreateGradeInput {
  santriId: number;
  subjectId: number;
  score: number;
  remarks?: string;
  semester: number;
  year: number;
}

export interface UpdateGradeInput {
  score?: number;
  remarks?: string;
}

export interface CreateAttendanceInput {
  santriId: number;
  date: string;
  status: "PRESENT" | "ABSENT" | "SICK" | "PERMIT";
  remarks?: string;
  recordedBy: number;
}

export interface UpdateAttendanceInput {
  status?: "PRESENT" | "ABSENT" | "SICK" | "PERMIT";
  remarks?: string;
}

// Tambahkan interface untuk Teachers
export interface Teacher {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Tambahkan function untuk mendapatkan teachers
export const teachersApi = {
  async list() {
    const res = await apiFetch(`/users?role=TEACHER`, {
      method: "GET",
    });
    return res as { data: Teacher[] } | Teacher[];
  },
};
