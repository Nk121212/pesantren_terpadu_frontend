"use client";

import { useState, useEffect } from "react";
import {
  tabunganApi,
  type Savings,
  type CreateTransactionRequest,
  parseBalance,
} from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, PiggyBank, Upload, AlertCircle } from "lucide-react";

export default function BuatTransaksiPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savings, setSavings] = useState<Savings | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const savingsId = Number(id);

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const savingsRes = await tabunganApi.getById(savingsId);
        if (savingsRes.success) {
          setSavings(savingsRes.data ?? null);
        } else {
          setError("Gagal memuat data rekening");
        }
        setInitialLoading(false);
      } catch (error) {
        console.error("Failed to fetch savings:", error);
        setError("Gagal memuat data rekening");
        setInitialLoading(false);
      }
    };

    fetchSavings();
  }, [savingsId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Get form values
      const type = formData.get("type") as "INCOME" | "EXPENSE";
      const amountValue = formData.get("amount");
      const description = formData.get("description") as string;

      // Validasi required fields
      if (!type || !amountValue || !description) {
        setError("Semua field wajib diisi");
        return;
      }

      // Convert dan validasi amount
      const amount = parseFloat(amountValue as string);

      if (isNaN(amount) || amount <= 0) {
        setError("Jumlah transaksi harus angka yang valid dan lebih dari 0");
        return;
      }

      if (amount < 1000) {
        setError("Minimum transaksi adalah Rp 1.000");
        return;
      }

      // Prepare transaction data
      const transactionData: CreateTransactionRequest = {
        type,
        amount: amount, // Number murni
        description: description.trim(),
        proof: proofFile || undefined,
      };

      // Create transaction
      const result = await tabunganApi.createTransaction(
        savingsId,
        transactionData
      );

      if (result.success) {
        alert("Transaksi berhasil dibuat! Menunggu approval admin.");
        router.push(`/tabungan/${savingsId}/transaksi`);
      } else {
        setError(result.error || "Gagal membuat transaksi");
      }
    } catch (error) {
      console.error("Transaction failed:", error);

      if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);

    if (file && file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      setProofFile(null);
      e.target.value = "";
    } else {
      setError(""); // Clear error jika file valid
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!savings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PiggyBank className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Rekening tidak ditemukan
          </h2>
          <Link href="/tabungan" className="text-blue-600 hover:text-blue-700">
            Kembali ke daftar tabungan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/tabungan/${savingsId}/transaksi`}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-blue-600" />
            Transaksi Baru
          </h1>
          <p className="text-gray-600 mt-1">
            {savings.santri?.name || `Santri ${savings.santriId}`} - Rekening #
            {savings.id}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Rekening */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          Informasi Rekening
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-600">Pemilik Rekening</p>
            <p className="font-medium text-blue-800">
              {savings.santri?.name || `Santri ${savings.santriId}`}
            </p>
          </div>
          <div>
            <p className="text-blue-600">ID Rekening</p>
            <p className="font-medium text-blue-800">#{savings.id}</p>
          </div>
          <div>
            <p className="text-blue-600">ID Santri</p>
            <p className="font-medium text-blue-800">{savings.santriId}</p>
          </div>
          <div>
            <p className="text-blue-600">Saldo Saat Ini</p>
            <p className="font-medium text-blue-800">
              {formatCurrency(parseBalance(savings.balance))}
            </p>
          </div>
        </div>
      </div>

      {/* Form Transaksi */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Transaksi *
            </label>
            <select
              name="type"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              defaultValue="INCOME"
            >
              <option value="INCOME">Setoran (Pemasukan)</option>
              <option value="EXPENSE">Penarikan (Pengeluaran)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Transaksi *
            </label>
            <input
              type="number"
              name="amount"
              required
              min="1000"
              step="1000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Masukkan jumlah transaksi"
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum transaksi: {formatCurrency(1000)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Transaksi *
            </label>
            <textarea
              name="description"
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Contoh: Setoran mingguan, Penarikan untuk keperluan sekolah, dll."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bukti Transaksi (Opsional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                name="proof"
                id="proof"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="proof" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {proofFile
                    ? proofFile.name
                    : "Klik untuk upload bukti transaksi"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Format: JPG, PNG, PDF (Maks. 5MB)
                </p>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href={`/tabungan/${savingsId}/transaksi`}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? "Memproses..." : "Buat Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
