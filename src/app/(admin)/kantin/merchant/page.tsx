"use client";

import { useEffect, useState } from "react";
import { canteenApi, type Merchant } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Store, Plus, Eye } from "lucide-react";

export default function MerchantListPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      setLoading(true);
      const result = await canteenApi.listMerchants();
      if (result.success) {
        setMerchants(result.data || []);
      }
    } catch (error) {
      console.error("Error loading merchants:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
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
      <div className="flex items-center gap-4">
        <Link
          href="/kantin"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-7 h-7 text-blue-600" />
            Semua Merchant
          </h1>
          <p className="text-gray-600 mt-1">
            Daftar semua merchant terdaftar di sistem
          </p>
        </div>
      </div>

      {/* Merchants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {merchants.map((merchant) => (
          <div
            key={merchant.id}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{merchant.name}</h3>
                <p className="text-sm text-gray-600">
                  User ID: {merchant.userId}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Saldo:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(merchant.balance)}
                </span>
              </div>
            </div>

            <Link
              href={`/kantin/merchant/${merchant.id}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Eye className="w-4 h-4" />
              Lihat Detail
            </Link>
          </div>
        ))}
      </div>

      {merchants.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Belum ada merchant terdaftar</p>
          <Link
            href="/kantin/merchant/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mt-4"
          >
            <Plus className="w-4 h-4" />
            Tambah Merchant Pertama
          </Link>
        </div>
      )}
    </div>
  );
}
