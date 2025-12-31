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

// Type guard function for DashboardSummary
function isDashboardSummary(data: unknown): data is DashboardSummary {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  // Check for finance object
  if (!obj.finance || typeof obj.finance !== "object") return false;
  const finance = obj.finance as Record<string, unknown>;
  if (
    typeof finance.totalIncome !== "number" ||
    typeof finance.totalExpense !== "number" ||
    typeof finance.net !== "number"
  ) {
    return false;
  }

  // Check for ppdb object
  if (!obj.ppdb || typeof obj.ppdb !== "object") return false;
  const ppdb = obj.ppdb as Record<string, unknown>;
  if (
    typeof ppdb.totalApplicants !== "number" ||
    typeof ppdb.totalAccepted !== "number" ||
    typeof ppdb.totalRejected !== "number"
  ) {
    return false;
  }

  // Check top-level numeric fields
  return typeof obj.savings === "number" && typeof obj.payroll === "number";
}

export const dashboardApi = {
  async getSummary(): Promise<ApiResponse<DashboardSummary>> {
    try {
      const res = await apiFetch("/reporting/dashboard-summary", {
        method: "GET",
      });

      if (isDashboardSummary(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid dashboard summary structure:", res.data);
        return {
          success: false,
          error: "Data dashboard summary tidak valid",
        };
      }
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
