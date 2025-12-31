"use client";

import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";
import { MenuProvider } from "@/lib/menu-context";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <MenuProvider>
      <SidebarProvider>
        <AdminLayoutBody>{children}</AdminLayoutBody>
      </SidebarProvider>
    </MenuProvider>
  );
}

function AdminLayoutBody({ children }: { children: ReactNode }) {
  const { open } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          open ? "ml-64" : "ml-16"
        )}
      >
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
