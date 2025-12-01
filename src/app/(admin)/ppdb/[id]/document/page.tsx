"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ppdbApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, FileText } from "lucide-react";

export default function UploadDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [applicantId, setApplicantId] = useState<number | null>(null);

  useEffect(() => {
    if (params.id) {
      console.log("Params ID:", params.id);
      const id = Number(params.id);
      if (!isNaN(id)) {
        setApplicantId(id);
      } else {
        console.error("Invalid applicant ID:", params.id);
        alert("ID pendaftar tidak valid");
        router.push("/ppdb");
      }
    }
  }, [params.id, router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicantId) {
      alert("ID pendaftar tidak valid");
      return;
    }

    if (!selectedFile) {
      alert("Pilih file terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const result = await ppdbApi.uploadDocument(applicantId, selectedFile);

      if (result.success) {
        alert("Dokumen berhasil diupload!");
        router.push(`/ppdb/${applicantId}`);
      } else {
        alert(result.error || "Gagal mengupload dokumen");
      }
    } catch (error) {
      console.error("Upload document error:", error);
      alert("Terjadi kesalahan saat mengupload dokumen");
    } finally {
      setLoading(false);
    }
  };

  // Jika applicantId belum tersedia, tampilkan loading
  if (applicantId === null) {
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
          href={`/ppdb/${applicantId}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Upload Dokumen Pendaftaran
          </h1>
          <p className="text-gray-600 mt-1">
            Tambah dokumen untuk pendaftar #{applicantId}
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Input */}
          <div className="space-y-2">
            <label
              htmlFor="document"
              className="block text-sm font-medium text-gray-700"
            >
              Pilih File Dokumen
            </label>

            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="document"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition ${
                  selectedFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {selectedFile ? (
                    <>
                      <FileText className="w-8 h-8 text-green-500 mb-2" />
                      <p className="mb-1 text-sm text-gray-900 font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="mb-1 text-sm text-gray-900 font-medium">
                        Klik untuk memilih file
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, JPG, PNG (Max. 10MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="document"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Link
              href={`/ppdb/${applicantId}`}
              className="flex-1 md:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload Dokumen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
