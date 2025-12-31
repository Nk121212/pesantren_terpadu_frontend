"use client";

import { apiFetch } from "./api";

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
      const user = data.data.user;
      const menu = data.data.menu || [];

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("menu", JSON.stringify(menu));

      document.cookie = `token=${token}; path=/; max-age=${
        60 * 60 * 24
      }; SameSite=Lax`;
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("menu");
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  window.location.href = "/login";
}

interface UserProfileResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  menu: unknown[];
}

export async function getUserProfile() {
  try {
    const response = await apiFetch<UserProfileResponse>("/auth/me");

    console.log("getUserProfile response:", response);
    return response;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return {
      success: false,
      error: "Failed to get user profile",
    };
  }
}
