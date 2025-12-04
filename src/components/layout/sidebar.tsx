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
  History,
  Calendar,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import Image from "next/image";
import { useState } from "react";

interface SubmenuItem {
  title: string;
  href: string;
}

interface BaseMenuItem {
  icon: LucideIcon;
}

interface RegularMenuItem extends BaseMenuItem {
  href: string;
  label: string;
  title?: never;
  submenu?: never;
}

interface ParentMenuItem extends BaseMenuItem {
  title: string;
  submenu: SubmenuItem[];
  href?: never;
  label?: never;
}

type MenuItem = RegularMenuItem | ParentMenuItem;

export default function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (title: string) => {
    if (openSubmenu === title) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(title);
    }
  };

  const links: MenuItem[] = [
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
    {
      href: "/audit",
      label: "Audit Trail",
      icon: History,
    },
    {
      title: "Akademik",
      icon: GraduationCap,
      submenu: [
        {
          title: "Dashboard",
          href: "/academic",
        },
        {
          title: "Mata Pelajaran",
          href: "/academic/subjects",
        },
        {
          title: "Nilai & Rapor",
          href: "/academic/grades",
        },
        {
          title: "Absensi",
          href: "/academic/attendance",
        },
      ],
    },
    {
      href: "/counseling",
      label: "Konseling",
      icon: Users,
    },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isAcademicActive = () => {
    const academicPaths = [
      "/academic",
      "/academic/subjects",
      "/academic/grades",
      "/academic/attendance",
    ];
    return academicPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col z-40 transition-all duration-300",
        open ? "w-64" : "w-16"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 border-b border-gray-100 bg-white z-50",
          open ? "px-6" : "px-4"
        )}
        style={{ height: "64px" }}
      >
        <div className="flex items-center justify-center h-full">
          <Image
            src="/next.svg"
            alt="Logo"
            width={open ? 120 : 32}
            height={32}
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <nav className="space-y-2 px-2">
          {links.map((link) => {
            const Icon = link.icon;

            const isParentMenuItem = (
              item: MenuItem
            ): item is ParentMenuItem => {
              return "submenu" in item && "title" in item;
            };

            if (isParentMenuItem(link)) {
              const isSubmenuOpen = openSubmenu === link.title;
              const hasActiveChild = isAcademicActive();

              return (
                <div key={link.title} className="relative">
                  <button
                    onClick={() => toggleSubmenu(link.title)}
                    className={cn(
                      "flex items-center rounded-lg transition-all duration-150 w-full",
                      open
                        ? "gap-3 px-3 py-2 justify-between"
                        : "justify-center py-2 px-1",
                      hasActiveChild
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {open && (
                        <span className="whitespace-nowrap truncate">
                          {link.title}
                        </span>
                      )}
                    </div>
                    {open &&
                      (isSubmenuOpen ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      ))}
                  </button>

                  {open && isSubmenuOpen && link.submenu && (
                    <div className="mt-1 ml-2 pl-8 space-y-1 border-l border-gray-200">
                      {link.submenu.map((subItem) => {
                        const isSubItemActive =
                          subItem.href === "/academic"
                            ? isActive(subItem.href, true)
                            : isActive(subItem.href);

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-sm",
                              isSubItemActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                            <span className="whitespace-nowrap truncate">
                              {subItem.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isStandaloneAcademic = link.href === "/academic/attendance";
            const active = isStandaloneAcademic
              ? pathname === "/academic/attendance"
              : isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-150",
                  open ? "gap-3 px-3 py-2" : "justify-center py-2 px-1",
                  active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {open && (
                  <span className="whitespace-nowrap truncate">
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
