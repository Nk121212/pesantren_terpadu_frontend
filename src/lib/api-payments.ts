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

export const paymentsApi = {
  async create(data: CreatePaymentDto): Promise<ApiResponse<Payment>> {
    try {
      const res = await apiFetch(`/payments`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
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
      return res;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  },

  async get(id: number): Promise<ApiResponse<Invoice>> {
    try {
      const res = await apiFetch(`/invoices/${id}`, { method: "GET" });
      return { success: true, data: res.data };
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
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error creating invoice:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat invoice",
      };
    }
  },
};
