// lib/api-canteen.ts
import {
  apiFetch,
  buildQueryString,
  ApiResponse,
  getToken,
  API_BASE_URL,
} from "./api-core";

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
  async createMerchant(
    data: CreateMerchantDto
  ): Promise<ApiResponse<Merchant>> {
    try {
      const res = await apiFetch(`/canteen/merchant`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error creating merchant:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal membuat merchant",
      };
    }
  },

  async getMerchant(id: number): Promise<ApiResponse<Merchant>> {
    try {
      const res = await apiFetch(`/canteen/merchant/${id}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching merchant:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data merchant",
      };
    }
  },

  async listMerchants(params?: {
    skip?: number;
    take?: number;
  }): Promise<ApiResponse<Merchant[]>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/canteen/merchant${qs}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching merchants:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data merchants",
      };
    }
  },

  async createTransaction(
    data: CreateCanteenTxDto,
    file?: File
  ): Promise<ApiResponse<CanteenTransaction>> {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("santriId", data.santriId.toString());
        formData.append("merchantId", data.merchantId.toString());
        formData.append("amount", data.amount.toString());
        if (data.description) formData.append("description", data.description);
        if (data.paymentMethod)
          formData.append("paymentMethod", data.paymentMethod);
        if (data.createdBy)
          formData.append("createdBy", data.createdBy.toString());
        formData.append("proof", file);

        const response = await fetch(`${API_BASE_URL}/canteen/transaction`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const result = await response.json();
        return { success: true, data: result };
      } else {
        const res = await apiFetch(`/canteen/transaction`, {
          method: "POST",
          body: JSON.stringify(data),
        });
        return { success: true, data: res.data };
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal membuat transaksi",
      };
    }
  },

  async listTransactions(
    merchantId: number
  ): Promise<ApiResponse<CanteenTransaction[]>> {
    try {
      const res = await apiFetch(`/canteen/transactions/${merchantId}`, {
        method: "GET",
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data transaksi",
      };
    }
  },
};
