// lib/api-tabungan.ts
import { apiFetch, ApiResponse, getToken, API_BASE_URL } from "./api-core";

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

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  SICK = "SICK",
  PERMIT = "PERMIT",
  ABSENT = "ABSENT",
}

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

export const parseBalance = (balance: string | number): number => {
  if (typeof balance === "number") return balance;
  return parseFloat(balance) || 0;
};

export const tabunganApi = {
  async create(data: CreateSavingsRequest): Promise<ApiResponse<Savings>> {
    try {
      const res = await apiFetch(`/savings`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error creating savings account:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat rekening tabungan",
      };
    }
  },

  async list(): Promise<ApiResponse<Savings[]>> {
    try {
      const res = await apiFetch(`/savings`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching savings list:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data tabungan",
      };
    }
  },

  async getById(id: number): Promise<ApiResponse<Savings>> {
    try {
      const res = await apiFetch(`/savings/${id}`, { method: "GET" });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching savings by ID:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data tabungan",
      };
    }
  },

  async getBalance(santriId: number): Promise<ApiResponse<SavingsBalance>> {
    try {
      const res = await apiFetch(`/savings/balance/${santriId}`, {
        method: "GET",
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching balance:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil saldo",
      };
    }
  },

  async createTransaction(
    savingsId: number,
    data: CreateTransactionRequest
  ): Promise<ApiResponse<SavingsTransaction>> {
    try {
      const payload = {
        type: data.type,
        amount: Number(data.amount),
        description: data.description || "",
      };

      const res = await apiFetch(`/savings/transaction/${savingsId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, data: res.data };
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
    savingsId: number
  ): Promise<ApiResponse<SavingsTransaction[]>> {
    try {
      const res = await apiFetch(`/savings/transaction/${savingsId}`, {
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
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error approving transaction:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal menyetujui transaksi",
      };
    }
  },

  async getAllBalances(): Promise<ApiResponse<SavingsBalance[]>> {
    try {
      const savingsRes = await this.list();

      if (!savingsRes.success || !Array.isArray(savingsRes.data)) {
        return {
          success: false,
          error: "Gagal mengambil data tabungan",
        };
      }

      if (savingsRes.data.length === 0) {
        return { success: true, data: [] };
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

      return { success: true, data: balances };
    } catch (error) {
      console.error("Error getting all balances:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil saldo",
      };
    }
  },
};
