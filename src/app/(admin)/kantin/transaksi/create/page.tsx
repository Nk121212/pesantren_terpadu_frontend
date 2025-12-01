"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { canteenApi, Merchant, Santri } from "@/lib/api";
import { santriApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CreditCard, Plus } from "lucide-react";

export default function CreateTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [santri, setSantri] = useState<Santri[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    santriId: "",
    merchantId: "",
    amount: "",
    description: "",
    paymentMethod: "QRIS" as "QRIS" | "VA" | "EWALLET" | "BANK_TRANSFER",
    createdBy: "1",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [merchantsRes, santriRes] = await Promise.all([
        canteenApi.listMerchants(),
        santriApi.list(),
      ]);

      if (merchantsRes.success) {
        setMerchants(merchantsRes.data || []);
      }

      if (santriRes && "data" in santriRes) {
        setSantri(Array.isArray(santriRes.data) ? santriRes.data : []);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transactionData = {
        santriId: parseInt(formData.santriId),
        merchantId: parseInt(formData.merchantId),
        amount: parseFloat(formData.amount),
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        createdBy: parseInt(formData.createdBy),
      };

      const result = await canteenApi.createTransaction(
        transactionData,
        selectedFile || undefined
      );

      if (result.success) {
        alert("Transaksi berhasil dibuat!");
        router.push("/kantin");
      } else {
        alert(`Gagal membuat transaksi: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Terjadi kesalahan saat membuat transaksi");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

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
            <CreditCard className="w-7 h-7 text-green-600" />
            Buat Transaksi Kantin
          </h1>
          <p className="text-gray-600 mt-1">
            Buat transaksi pembayaran kantin cashless
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Data Transaksi
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Isi data transaksi dengan lengkap dan benar
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Santri
                </label>
                <select
                  name="santriId"
                  value={formData.santriId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Santri</option>
                  {santri.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merchant
                </label>
                <select
                  name="merchantId"
                  value={formData.merchantId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Merchant</option>
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Transaksi
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Masukkan jumlah transaksi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="QRIS">QRIS</option>
                <option value="VA">Virtual Account</option>
                <option value="EWALLET">E-Wallet</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi (Opsional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi transaksi..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bukti Pembayaran (Opsional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload bukti pembayaran jika ada
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Link
                href="/kantin"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Membuat...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Buat Transaksi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
