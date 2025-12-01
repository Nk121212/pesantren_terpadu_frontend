"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import { Eye, EyeOff, LogIn, School, User, Lock, BookOpen } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const res = await loginUser({ email, password });

      if (res?.data?.access_token) {
        router.push("/dashboard");
      } else {
        setError(
          res?.message || "Login gagal. Periksa email dan password Anda."
        );
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Section - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Pesantren Terpadu
            </h1>
            <p className="text-gray-500">Sistem Manajemen Modern</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            placeholder-gray-400 text-gray-900"
                  placeholder="masukkan email anda"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            placeholder-gray-400 text-gray-900"
                  placeholder="masukkan password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 transform -translate-y-1/2"
                  style={{ right: "3%" }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600
                        text-white py-3 rounded-lg font-semibold
                        transition-colors duration-200 disabled:opacity-50 
                        flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm text-center font-medium mb-2">
              Akses Demo:
            </p>
            <div className="text-center space-y-1">
              <p className="text-gray-800 text-sm font-mono">
                superadmin@pesantren.com
              </p>
              <p className="text-gray-800 text-sm font-mono">admin123</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              © 2024 Pesantren Terpadu. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Illustration */}
      {/* <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 hidden lg:flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-gray-200">
            <School className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            Selamat Datang
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Sistem manajemen terintegrasi untuk mengelola aktivitas pesantren
            secara modern dan efisien.
          </p>
        </div>
      </div> */}
    </div>
  );
}
