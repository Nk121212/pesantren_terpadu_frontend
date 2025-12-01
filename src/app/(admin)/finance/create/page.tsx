"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { financeApi, type CreateTransactionDto } from "@/lib/finance-api";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function CreateFinanceTransactionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "INCOME" as "INCOME" | "EXPENSE",
    category: "",
    amount: "",
    description: "",
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.category || !formData.amount) {
      setError("Kategori dan jumlah harus diisi");
      setLoading(false);
      return;
    }

    try {
      const transactionData = {
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        createdBy: user?.id,
        proof: proofFile || undefined,
      };

      const result = await financeApi.create(transactionData);

      if (result.success) {
        router.push("/finance");
      } else {
        setError(result.error || "Failed to create transaction");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
    }
  };

  const commonCategories = {
    INCOME: ["SPP", "Uang Bangunan", "Dana Kegiatan", "Donasi", "Lainnya"],
    EXPENSE: ["Gaji", "Operasional", "Pemeliharaan", "Kegiatan", "Lainnya"],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/finance"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-blue-600" />
              Tambah Transaksi Keuangan
            </h1>
            <p className="text-gray-600 mt-1">
              Buat transaksi pendapatan atau pengeluaran baru
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Form Transaksi
          </h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Transaksi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        type: "INCOME",
                        category: "",
                      }))
                    }
                    className={`p-4 border rounded-lg text-center transition ${
                      formData.type === "INCOME"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <TrendingUp
                      className={`w-6 h-6 mx-auto mb-2 ${
                        formData.type === "INCOME"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="font-medium">Pendapatan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        type: "EXPENSE",
                        category: "",
                      }))
                    }
                    className={`p-4 border rounded-lg text-center transition ${
                      formData.type === "EXPENSE"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <TrendingDown
                      className={`w-6 h-6 mx-auto mb-2 ${
                        formData.type === "EXPENSE"
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="font-medium">Pengeluaran</span>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Kategori
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {commonCategories[formData.type].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Jumlah (Rp)
              </label>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Keterangan
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Deskripsi transaksi..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* File Upload */}
            <div>
              <label
                htmlFor="proof"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bukti Transaksi (Opsional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="proof"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {proofFile && (
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {proofFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: JPG, PNG, PDF (maks. 5MB)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Membuat Transaksi...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Buat Transaksi
                  </>
                )}
              </button>
              <Link
                href="/finance"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
