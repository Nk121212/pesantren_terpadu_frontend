"use client";

import { useEffect, useState } from "react";
import SummaryCards from "@/components/dashboard/SummaryCards";
import { dashboardApi } from "@/lib/api";
import type { DashboardSummary, ApiResponse } from "@/lib/api";

export default function SummarySection() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .getSummary()
      .then((response: ApiResponse<DashboardSummary>) => {
        console.log(response);

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error || "Failed to fetch data");
        }

        setLoading(false);
      })

      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan";
        setError(message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 font-semibold mb-2">Error</div>
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 font-semibold mb-2">No Data</div>
        <div className="text-yellow-500">No dashboard data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Finance Cards */}
      <SummaryCards data={data} />

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PPDB Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            PPDB Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Applicants</span>
              <span className="text-xl font-bold text-blue-600">
                {data.ppdb?.totalApplicants || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Accepted</span>
              <span className="text-xl font-bold text-green-600">
                {data.ppdb?.totalAccepted || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejected</span>
              <span className="text-xl font-bold text-red-600">
                {data.ppdb?.totalRejected || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Payroll */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payroll</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Payroll</span>
              <span className="text-xl font-bold text-purple-600">
                Rp {data.payroll?.toLocaleString("id-ID") || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
              Add Transaction
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium text-sm">
              View Report
            </button>
            <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition font-medium text-sm">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
