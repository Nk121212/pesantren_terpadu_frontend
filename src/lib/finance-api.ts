import { apiFetch, ApiResponse } from "./api";

// Export types
export interface FinanceTransaction {
  id: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description?: string;
  proofUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdBy?: number;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description?: string;
  createdBy?: number;
  proof?: File;
}

export interface UpdateTransactionDto {
  category?: string;
  amount?: number;
  description?: string;
  proofUrl?: string;
}

export interface FinanceStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingTransactions: number;
}

export const financeApi = {
  // Create transaction dengan file upload - FIXED untuk NestJS dengan api prefix
  async create(
    data: CreateTransactionDto
  ): Promise<ApiResponse<FinanceTransaction>> {
    try {
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("category", data.category);
      formData.append("amount", data.amount.toString());

      if (data.description) {
        formData.append("description", data.description);
      }

      if (data.createdBy) {
        formData.append("createdBy", data.createdBy.toString());
      }

      if (data.proof) {
        formData.append("proof", data.proof);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Gunakan apiFetch untuk konsistensi, tapi handle FormData khusus
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // JANGAN set Content-Type untuk FormData, browser akan set otomatis
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (jsonError) {
          const textError = await response.text();
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error("❌ Error in finance create:", error);

      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Failed to create transaction" };
    }
  },

  // Get transaction by ID
  async get(id: number): Promise<ApiResponse<FinanceTransaction>> {
    try {
      const response = await apiFetch(`/finance/${id}`, {
        method: "GET",
      });

      // Handle response format
      if (response && typeof response === "object") {
        if (response.data) {
          return { success: true, data: response.data };
        } else {
          return { success: true, data: response };
        }
      }

      return {
        success: false,
        error: "Invalid response format",
      };
    } catch (error) {
      console.error("❌ Error in finance get:", error);

      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Failed to fetch transaction" };
    }
  },

  // List transactions dengan pagination
  async list(params?: {
    skip?: number;
    take?: number;
    type?: "INCOME" | "EXPENSE";
    status?: string;
  }): Promise<ApiResponse<FinanceTransaction[]>> {
    try {
      let url = "/finance";
      const queryParams = new URLSearchParams();

      if (params?.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params?.take !== undefined)
        queryParams.append("take", params.take.toString());
      if (params?.type) queryParams.append("type", params.type);
      if (params?.status) queryParams.append("status", params.status);

      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      const response = await apiFetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle berbagai format response
      if (Array.isArray(response)) {
        return { success: true, data: response };
      }

      if (response && typeof response === "object") {
        if (Array.isArray(response.data)) {
          return { success: true, data: response.data };
        } else if (response.data === null || response.data === undefined) {
          return { success: true, data: [] };
        } else {
          return { success: true, data: [] };
        }
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error("❌ Error in finance list:", error);

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

  // Update transaction
  async update(
    id: number,
    data: UpdateTransactionDto
  ): Promise<ApiResponse<FinanceTransaction>> {
    try {
      const response = await apiFetch(`/finance/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (response && typeof response === "object") {
        if (response.data) {
          return { success: true, data: response.data };
        } else {
          return { success: true, data: response };
        }
      }

      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("❌ Error in finance update:", error);

      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Failed to update transaction" };
    }
  },

  // Delete transaction
  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      await apiFetch(`/finance/${id}`, { method: "DELETE" });
      return { success: true };
    } catch (error) {
      console.error("❌ Error in finance delete:", error);

      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Failed to delete transaction" };
    }
  },

  // Approve transaction
  async approve(
    id: number,
    userId: number
  ): Promise<ApiResponse<FinanceTransaction>> {
    try {
      const response = await apiFetch(`/finance/approve/${id}/${userId}`, {
        method: "PATCH",
      });

      if (response && typeof response === "object") {
        if (response.data) {
          return { success: true, data: response.data };
        } else {
          return { success: true, data: response };
        }
      }

      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("❌ Error in finance approve:", error);

      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Failed to approve transaction" };
    }
  },

  // Reject transaction
  async reject(
    id: number,
    userId: number
  ): Promise<ApiResponse<FinanceTransaction>> {
    try {
      const response = await apiFetch(`/finance/reject/${id}/${userId}`, {
        method: "PATCH",
      });

      if (response && typeof response === "object") {
        if (response.data) {
          return { success: true, data: response.data };
        } else {
          return { success: true, data: response };
        }
      }

      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("❌ Error in finance reject:", error);

      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Failed to reject transaction" };
    }
  },

  // Get finance statistics
  async getStats(): Promise<ApiResponse<FinanceStats>> {
    try {
      const transactionsRes = await this.list({ take: 1000 });

      if (!transactionsRes.success) {
        return {
          success: false,
          error:
            transactionsRes.error || "Failed to fetch transactions for stats",
        };
      }

      const transactions = transactionsRes.data || [];

      const stats: FinanceStats = {
        totalIncome: transactions
          .filter((t) => t.type === "INCOME" && t.status === "APPROVED")
          .reduce((sum, t) => sum + Number(t.amount), 0),
        totalExpense: transactions
          .filter((t) => t.type === "EXPENSE" && t.status === "APPROVED")
          .reduce((sum, t) => sum + Number(t.amount), 0),
        balance: 0,
        pendingTransactions: transactions.filter((t) => t.status === "PENDING")
          .length,
      };

      stats.balance = stats.totalIncome - stats.totalExpense;

      return { success: true, data: stats };
    } catch (error) {
      console.error("❌ Error in finance stats:", error);

      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Failed to fetch finance stats" };
    }
  },
};
