// src\lib\auth.ts
"use client";

import { apiFetch } from "./api";
// Hapus import { redirect } dari 'next/navigation' di sini,
// karena kita menggunakan window.location.href (hard redirect) di LoginPage
// jika Anda tetap ingin menggunakan redirect("/login") di logout, biarkan.

export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (data.data?.access_token) {
      const token = data.data.access_token;

      // PERBAIKAN 1: Simpan ke LocalStorage (Untuk apiFetch)
      localStorage.setItem("token", token);

      // PERBAIKAN 2: Simpan ke Cookie (Untuk Middleware)
      // max-age=86400 sama dengan 24 jam (60 * 60 * 24)
      document.cookie = `token=${token}; path=/; max-age=${
        60 * 60 * 24
      }; SameSite=Lax`;
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    // Lebih baik melempar objek error daripada hanya pesan string
    throw error;
  }
}

export function logoutUser() {
  localStorage.removeItem("token");
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  window.location.href = "/login";
}

export async function getUserProfile() {
  return apiFetch("/auth/me");
}
