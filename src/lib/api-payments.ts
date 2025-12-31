// lib/api-payments.ts
import { apiFetch, buildQueryString, ApiResponse, Paginated } from "./api-core";
import type { Santri } from "./api-santri";

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

// Type guard functions
function isPayment(data: unknown): data is Payment {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  const validPaymentMethods = Object.values(PaymentMethod);
  const validPaymentStatuses = Object.values(PaymentStatus);

  return (
    typeof obj.id === "number" &&
    typeof obj.invoiceId === "number" &&
    typeof obj.amount === "number" &&
    typeof obj.createdAt === "string" &&
    typeof obj.updatedAt === "string" &&
    validPaymentMethods.includes(obj.method as PaymentMethod) &&
    validPaymentStatuses.includes(obj.status as PaymentStatus) &&
    (obj.proofUrl === undefined || typeof obj.proofUrl === "string") &&
    (obj.paidAt === undefined || typeof obj.paidAt === "string")
  );
}

function isPaymentArray(data: unknown): data is Payment[] {
  return Array.isArray(data) && data.every(isPayment);
}

function isInvoice(data: unknown): data is Invoice {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  const validInvoiceStatuses = Object.values(InvoiceStatus);

  return (
    typeof obj.id === "number" &&
    typeof obj.santriId === "number" &&
    typeof obj.amount === "number" &&
    typeof obj.description === "string" &&
    typeof obj.dueDate === "string" &&
    typeof obj.createdAt === "string" &&
    typeof obj.updatedAt === "string" &&
    validInvoiceStatuses.includes(obj.status as InvoiceStatus) &&
    (obj.santriName === undefined || typeof obj.santriName === "string")
  );
}

function isDuitkuPaymentResponse(data: unknown): data is DuitkuPaymentResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.paymentUrl === "string" && typeof obj.reference === "string"
  );
}

function isMessageResponse(data: unknown): data is { message: string } {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.message === "string";
}

function isPaginatedInvoice(data: unknown): data is Paginated<Invoice> {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  // Versi 1: Cek struktur dengan meta (pagination standard)
  if ("data" in obj && "meta" in obj && obj.meta && typeof obj.meta === "object") {
    const meta = obj.meta as Record<string, unknown>;
    const hasPaginationFields =
      "total" in meta &&
      "page" in meta &&
      "per_page" in meta &&
      "total_pages" in meta;

    if (Array.isArray(obj.data)) {
      return hasPaginationFields && obj.data.every(isInvoice);
    }
  }

  // Versi 2: Cek struktur API Anda (dengan success dan message)
  if ("success" in obj && "data" in obj && "message" in obj) {
    if (obj.success === true && Array.isArray(obj.data)) {
      return obj.data.every(isInvoice);
    }
  }

  return false;
}

export const paymentsApi = {
  async create(data: CreatePaymentDto): Promise<ApiResponse<Payment>> {
    try {
      const res = await apiFetch(`/payments`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (isPayment(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid payment data structure:", res.data);
        return {
          success: false,
          error: "Data pembayaran tidak valid",
        };
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal membuat pembayaran",
      };
    }
  },

  async get(id: number): Promise<ApiResponse<Payment>> {
    try {
      const res = await apiFetch(`/payments/${id}`, { method: "GET" });

      if (isPayment(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid payment data structure:", res.data);
        return {
          success: false,
          error: "Data pembayaran tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data pembayaran",
      };
    }
  },

  async getByInvoice(invoiceId: number): Promise<ApiResponse<Payment[]>> {
    try {
      const res = await apiFetch(`/payments/invoice/${invoiceId}`, {
        method: "GET",
      });

      if (isPaymentArray(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid payments array structure:", res.data);
        return {
          success: false,
          error: "Data pembayaran array tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching payments by invoice:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data pembayaran",
      };
    }
  },

  async update(
    id: number,
    data: UpdatePaymentDto
  ): Promise<ApiResponse<Payment>> {
    try {
      const res = await apiFetch(`/payments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (isPayment(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid payment data structure:", res.data);
        return {
          success: false,
          error: "Data pembayaran tidak valid",
        };
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengupdate pembayaran",
      };
    }
  },

  async delete(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await apiFetch(`/payments/${id}`, { method: "DELETE" });

      if (isMessageResponse(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid message response structure:", res.data);
        return {
          success: false,
          error: "Response tidak valid",
        };
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal menghapus pembayaran",
      };
    }
  },

  async createDuitkuPayment(
    invoiceId: number,
    method: PaymentMethod,
    amount: number
  ): Promise<ApiResponse<DuitkuPaymentResponse>> {
    try {
      const res = await apiFetch(`/payments/duitku/${invoiceId}/${method}`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      });

      if (isDuitkuPaymentResponse(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid Duitku payment response structure:", res.data);
        return {
          success: false,
          error: "Response Duitku payment tidak valid",
        };
      }
    } catch (error) {
      console.error("Error creating Duitku payment:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat pembayaran Duitku",
      };
    }
  },

  async createRecurringInvoice(
    data: CreateRecurringInvoiceDto
  ): Promise<ApiResponse<Invoice>> {
    try {
      const res = await apiFetch(`/payments/recurring`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (isInvoice(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid invoice data structure:", res.data);
        return {
          success: false,
          error: "Data invoice tidak valid",
        };
      }
    } catch (error) {
      console.error("Error creating recurring invoice:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat invoice berulang",
      };
    }
  },

  async simulateWebhook(
    payload: unknown
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await apiFetch(`/payments/webhook`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (isMessageResponse(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid webhook response structure:", res.data);
        return {
          success: false,
          error: "Response webhook tidak valid",
        };
      }
    } catch (error) {
      console.error("Error simulating webhook:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal simulasi webhook",
      };
    }
  },
};

export const invoicesApi = {
  async list(params?: {
    page?: number;
    per_page?: number;
    santriId?: number;
  }): Promise<Paginated<Invoice>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/invoices${qs}`, { method: "GET" });

      if (isPaginatedInvoice(res)) {
        return res;
      } else {
        console.error("Invalid paginated invoices structure:", res);
        throw new Error("Data invoices paginated tidak valid");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  },

  async get(id: number): Promise<ApiResponse<Invoice>> {
    try {
      const res = await apiFetch(`/invoices/${id}`, { method: "GET" });

      if (isInvoice(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid invoice data structure:", res.data);
        return {
          success: false,
          error: "Data invoice tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data invoice",
      };
    }
  },

  async create(data: {
    santriId: number;
    amount: number;
    description: string;
    dueDate?: string;
  }): Promise<ApiResponse<Invoice>> {
    try {
      const res = await apiFetch(`/invoices`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (isInvoice(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid invoice data structure:", res.data);
        return {
          success: false,
          error: "Data invoice tidak valid",
        };
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat invoice",
      };
    }
  },
};
