"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  DollarSign,
  PiggyBank,
  FileText,
  CookingPot,
} from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/santri",
      label: "Santri",
      icon: Users,
    },
    {
      href: "/tagihan",
      label: "Tagihan",
      icon: DollarSign,
    },
    {
      href: "/tabungan",
      label: "Tabungan",
      icon: PiggyBank,
    },
    {
      href: "/finance",
      label: "Keuangan",
      icon: DollarSign,
    },
    {
      href: "/ppdb",
      label: "PPDB",
      icon: FileText,
    },
    {
      href: "/kantin",
      label: "Kantin",
      icon: CookingPot,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col z-40 transition-all duration-300",
        open ? "w-64 px-4" : "w-16 px-2"
      )}
    >
      {/* LOGO */}
      <div
        className={cn(
          "flex items-center justify-center border-b border-gray-100",
          open ? "h-16 px-2" : "h-16"
        )}
      >
        <Image
          src="/next.svg"
          alt="Logo"
          width={open ? 120 : 32}
          height={32}
          className="object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-2 flex-1">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-lg transition-all duration-150",
                open ? "gap-3 px-3 py-2" : "justify-center py-2",
                active
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              {open && <span className="whitespace-nowrap">{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
