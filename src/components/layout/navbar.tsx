"use client";

import { Menu, Bell, LogOut } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/api"; // Import fungsi logout dari api.ts
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { toggle, open } = useSidebar();
  const router = useRouter();

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      logout(); // Panggil fungsi logout dari api.ts
      router.push("/login"); // Redirect ke halaman login
    }
  };

  return (
    <header
      className={cn(
        "h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-30 shadow-sm transition-all duration-300"
      )}
      style={{
        marginLeft: open ? "256px" : "64px",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={handleLogout}
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-red-100 transition cursor-pointer"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </header>
  );
}
