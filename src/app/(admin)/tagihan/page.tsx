"use client";

import { useEffect, useState } from "react";
import {
  invoicesApi,
  type Invoice,
  type Paginated,
  PaymentMethod,
} from "@/lib/api";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function TagihanListPage() {
  const [data, setData] = useState<Paginated<Invoice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    invoicesApi
      .list({ page: 1, per_page: 20 })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredInvoices = data?.data?.filter(
    (invoice) =>
      invoice.santri?.name?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.description.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      PARTIAL: {
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
        label: "Partial",
      },
      PAID: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Lunas",
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Dibatalkan",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalPaid = (invoice: Invoice) => {
    if (!invoice.payments) return 0;
    return invoice.payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-blue-600" />
            Daftar Tagihan
          </h1>
          <p className="text-gray-600 mt-1">Kelola tagihan santri pesantren</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/tagihan/create-recurring"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Tagihan Berulang
          </Link>
          <Link
            href="/tagihan/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Buat Tagihan
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tagihan</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.data?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {data?.data?.filter((t) => t.status === "PENDING").length || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lunas</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {data?.data?.filter((t) => t.status === "PAID").length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Partial</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {data?.data?.filter((t) => t.status === "PARTIAL").length || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari santri atau deskripsi tagihan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Santri
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dibayar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jatuh Tempo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices?.map((invoice) => {
                const totalPaid = getTotalPaid(invoice);
                const remaining = invoice.amount - totalPaid;

                return (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {invoice.santri?.name || `Santri ${invoice.santriId}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {invoice.santriId}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">
                        {invoice.description}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Dibuat:{" "}
                        {new Date(invoice.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-green-600 font-medium">
                          {formatCurrency(totalPaid)}
                        </p>
                        {remaining > 0 && (
                          <p className="text-sm text-red-600">
                            Sisa: {formatCurrency(remaining)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(invoice.dueDate).toLocaleDateString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tagihan/${invoice.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {(invoice.status === "PENDING" ||
                          invoice.status === "PARTIAL") && (
                          <Link
                            href={`/tagihan/${invoice.id}/bayar`}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
                          >
                            Bayar
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(!filteredInvoices || filteredInvoices.length === 0) && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada data tagihan</p>
            {search && (
              <p className="text-gray-400 mt-2">
                Tidak ditemukan tagihan dengan kata kunci {search}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
