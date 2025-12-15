// lib/api-dashboard.ts
import { apiFetch, ApiResponse } from "./api-core";

export interface DashboardSummary {
  finance: {
    totalIncome: number;
    totalExpense: number;
    net: number;
  };
  savings: number;
  payroll: number;
  ppdb: {
    totalApplicants: number;
    totalAccepted: number;
    totalRejected: number;
  };
}

export const dashboardApi = {
  async getSummary(): Promise<ApiResponse<DashboardSummary>> {
    try {
      const res = await apiFetch("/reporting/dashboard-summary", {
        method: "GET",
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data dashboard",
      };
    }
  },
};
