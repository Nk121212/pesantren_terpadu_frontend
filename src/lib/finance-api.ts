import { apiFetch, ApiResponse } from "./api";

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
  async create(
    data: CreateTransactionDto
  ): Promise<ApiResponse<FinanceTransaction>> {
    try {
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("category", data.category);
      formData.append("amount", data.amount.toString());

      if (data.description) formData.append("description", data.description);
      if (data.createdBy)
        formData.append("createdBy", data.createdBy.toString());
      if (data.proof) formData.append("proof", data.proof);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let message = "Failed to create transaction";
        try {
          const err = await response.json();
          message = err.message ?? message;
        } catch {
          // ignore
        }
        return { success: false, error: message };
      }

      const result: FinanceTransaction = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create transaction",
      };
    }
  },

  async get(id: number): Promise<ApiResponse<FinanceTransaction>> {
    return apiFetch<FinanceTransaction>(`/finance/${id}`, {
      method: "GET",
    });
  },

  async list(params?: {
    skip?: number;
    take?: number;
    type?: "INCOME" | "EXPENSE";
    status?: string;
  }): Promise<ApiResponse<FinanceTransaction[]>> {
    const query = new URLSearchParams();

    if (params?.skip !== undefined) query.append("skip", String(params.skip));
    if (params?.take !== undefined) query.append("take", String(params.take));
    if (params?.type) query.append("type", params.type);
    if (params?.status) query.append("status", params.status);

    const url = query.toString() ? `/finance?${query.toString()}` : "/finance";

    return apiFetch<FinanceTransaction[]>(url, { method: "GET" });
  },

  async update(
    id: number,
    data: UpdateTransactionDto
  ): Promise<ApiResponse<FinanceTransaction>> {
    return apiFetch<FinanceTransaction>(`/finance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return apiFetch<void>(`/finance/${id}`, {
      method: "DELETE",
    });
  },

  async approve(
    id: number,
    userId: number
  ): Promise<ApiResponse<FinanceTransaction>> {
    return apiFetch<FinanceTransaction>(`/finance/approve/${id}/${userId}`, {
      method: "PATCH",
    });
  },

  async reject(
    id: number,
    userId: number
  ): Promise<ApiResponse<FinanceTransaction>> {
    return apiFetch<FinanceTransaction>(`/finance/reject/${id}/${userId}`, {
      method: "PATCH",
    });
  },

  async getStats(): Promise<ApiResponse<FinanceStats>> {
    const res = await this.list({ take: 1000 });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Failed to fetch finance stats",
      };
    }

    const transactions = res.data;

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME" && t.status === "APPROVED")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE" && t.status === "APPROVED")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const stats: FinanceStats = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pendingTransactions: transactions.filter((t) => t.status === "PENDING")
        .length,
    };

    return { success: true, data: stats };
  },
};
