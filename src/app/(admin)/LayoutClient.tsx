"use client";

import { SidebarProvider } from "@/lib/sidebar-context";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useSidebar } from "@/lib/sidebar-context";
import { cn } from "@/lib/utils";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <LayoutBody>{children}</LayoutBody>
    </SidebarProvider>
  );
}

function LayoutBody({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - dipindah ke atas dan tanpa positioning conflict */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          open ? "ml-64" : "ml-16"
        )}
      >
        {/* Navbar - sekarang di dalam main content */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 px-6 py-6 mt-16">{children}</main>
      </div>
    </div>
  );
}
