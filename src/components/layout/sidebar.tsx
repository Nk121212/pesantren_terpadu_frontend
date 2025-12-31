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
  Book,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  LucideIcon,
  Settings,
  Menu as MenuIcon,
  Shield,
  User,
  CreditCard,
  BarChart,
  BookOpen,
  Heart,
  Folder,
  Layers,
  Briefcase,
  MessageSquare,
  Calendar,
  Clipboard,
  File,
  ShoppingCart,
  School,
  Building,
  Wallet,
  Receipt,
  Package,
  Clock,
  Bell,
  Award,
  Target,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import { useAuth } from "@/lib/auth-context";
import type { Menu } from "@/lib/api-menu";
import Image from "next/image";
import { useState, useMemo, useCallback, useEffect } from "react";

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
  href?: string;
  label?: never;
}

type SidebarMenuItem = RegularMenuItem | ParentMenuItem;

// Mapping icon name string ke komponen LucideIcon
const iconMap: Record<string, LucideIcon> = {
  Home,
  Users,
  DollarSign,
  PiggyBank,
  FileText,
  CookingPot,
  History,
  Book,
  GraduationCap,
  Settings,
  Shield,
  User,
  CreditCard,
  BarChart,
  BookOpen,
  Heart,
  Folder,
  Layers,
  Briefcase,
  MessageSquare,
  Calendar,
  Clipboard,
  File,
  ShoppingCart,
  School,
  Building,
  Wallet,
  Receipt,
  Package,
  Clock,
  Bell,
  Award,
  Target,
  TrendingUp,
  PieChart,
  MenuIcon,
};

// Helper function untuk cek permission
const hasViewPermission = (menu: Menu): boolean => {
  // Cek permissions object langsung
  if (menu.permissions && typeof menu.permissions === "object") {
    return menu.permissions.canView === true;
  }

  // Cek roleMenus array
  if (
    menu.roleMenus &&
    Array.isArray(menu.roleMenus) &&
    menu.roleMenus.length > 0
  ) {
    return menu.roleMenus[0].canView === true;
  }

  // Default: jika tidak ada permission info, asumsikan bisa dilihat
  return true;
};

// Helper function untuk mendapatkan href yang aman
const getSafeHref = (href: string | undefined): string => {
  return href && href !== "#" ? href : "#";
};

// Helper function untuk mendapatkan title yang aman
const getSafeTitle = (title: string | undefined): string => {
  return title || "";
};

export default function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { menu: serverMenu, user, loading } = useAuth();

  // Debug: Lihat data menu
  useEffect(() => {
    console.log("=== DEBUG SIDEBAR ===");
    console.log("Loading:", loading);
    console.log("User:", user);
    console.log("Server Menu type:", typeof serverMenu);
    console.log("Server Menu is array?", Array.isArray(serverMenu));
    console.log("Server Menu:", serverMenu);

    if (serverMenu && Array.isArray(serverMenu)) {
      console.log(`Total menu items: ${serverMenu.length}`);

      serverMenu.forEach((menu, index) => {
        console.log(
          `[${index}] ${menu.name || "No name"}`,
          `- id: ${menu.id}`,
          `- parentId: ${menu.parentId}`,
          `- path: "${menu.path}"`,
          `- children: ${menu.children?.length || 0}`,
          `- isActive: ${menu.isActive}`,
          `- order: ${menu.order}`
        );
      });
    } else {
      console.log("No valid menu data");
    }
    console.log("=== END DEBUG ===");
  }, [serverMenu, user, loading]);

  const toggleSubmenu = (title: string) => {
    if (openSubmenu === title) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(title);
    }
  };

  // Default links jika belum login atau menu kosong
  const getDefaultLinks = useCallback((): SidebarMenuItem[] => {
    return [
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
        title: "Akademik",
        icon: GraduationCap,
        submenu: [
          {
            title: "Dashboard Akademik",
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
    ];
  }, []);

  // Fungsi untuk mengonversi menu dari server ke format sidebar
  const convertServerMenuToSidebarFormat = useCallback(
    (serverMenus: Menu[] | null): SidebarMenuItem[] => {
      console.log("🔄 Converting server menus...");
      console.log("Input:", serverMenus);

      // Validasi input
      if (
        !serverMenus ||
        !Array.isArray(serverMenus) ||
        serverMenus.length === 0
      ) {
        console.log("⚠️ No valid server menus, using default");
        return getDefaultLinks();
      }

      try {
        // Filter hanya menu yang isActive = true
        const activeMenus = serverMenus.filter(
          (menu) => menu.isActive !== false
        );
        console.log(
          `✅ Active menus: ${activeMenus.length}/${serverMenus.length}`
        );

        // Urutkan menu berdasarkan order
        const sortedMenus = [...activeMenus].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );

        console.log("📊 Processing sorted menus:");
        sortedMenus.forEach((menu, index) => {
          console.log(
            `${index + 1}. ${menu.name} (order: ${menu.order}) - children: ${
              menu.children?.length || 0
            }`
          );
        });

        const result: SidebarMenuItem[] = [];

        sortedMenus.forEach((menu) => {
          // Skip jika tidak punya name (invalid data)
          if (!menu.name) {
            console.log(`⚠️ Skipping menu without name`);
            return;
          }

          // Cek apakah user memiliki permission untuk melihat menu ini
          if (!hasViewPermission(menu)) {
            console.log(`   ⏭️ Skipping ${menu.name} - no view permission`);
            return;
          }

          const IconComponent = iconMap[menu.icon || ""] || Home;

          // Cek apakah menu ini adalah parent menu (parentId null atau undefined)
          const isParentMenu =
            menu.parentId === null ||
            menu.parentId === undefined ||
            menu.parentId === 0;

          if (!isParentMenu) {
            console.log(
              `   ⏭️ Skipping ${menu.name} - not a parent menu (parentId: ${menu.parentId})`
            );
            return; // Skip child menus
          }

          // Cek apakah menu ini punya children
          const hasChildren =
            menu.children &&
            Array.isArray(menu.children) &&
            menu.children.length > 0;
          console.log(
            `   ${hasChildren ? "📂 Has children" : "📄 No children"}`
          );

          if (hasChildren && menu.children) {
            // Filter children yang accessible
            const accessibleChildren = menu.children.filter((child) => {
              const isAccessible =
                hasViewPermission(child) && child.isActive !== false;
              return isAccessible;
            });

            console.log(`   Accessible children: ${accessibleChildren.length}`);

            if (accessibleChildren.length > 0) {
              // Buat parent menu dengan submenu
              const submenuItems: SubmenuItem[] = accessibleChildren.map(
                (child) => ({
                  title: child.name || "",
                  href: getSafeHref(child.path),
                })
              );

              console.log(
                `   ✅ Creating parent menu with submenu for ${menu.name}`
              );
              result.push({
                title: menu.name || "",
                icon: IconComponent,
                submenu: submenuItems,
                href: getSafeHref(menu.path),
              });
            } else if (menu.path) {
              // Jika tidak ada children yang accessible tapi punya path, buat regular menu
              console.log(
                `   ✅ Creating regular menu for ${menu.name} (has path, no accessible children)`
              );
              result.push({
                href: getSafeHref(menu.path),
                label: menu.name || "",
                icon: IconComponent,
              });
            }
          } else {
            // Menu tanpa children
            if (menu.path) {
              console.log(
                `   ✅ Creating regular menu for ${menu.name} (no children)`
              );
              result.push({
                href: getSafeHref(menu.path),
                label: menu.name || "",
                icon: IconComponent,
              });
            } else {
              console.log(
                `   ⚠️ Skipping ${menu.name} - no children and no path`
              );
            }
          }
        });

        console.log("🎯 Final sidebar menu items:", result.length);
        result.forEach((item, index) => {
          if ("submenu" in item) {
            console.log(
              `${index + 1}. 📂 ${item.title} - ${
                item.submenu?.length || 0
              } subitems`
            );
          } else {
            console.log(`${index + 1}. 📄 ${item.label} - ${item.href}`);
          }
        });

        return result;
      } catch (error) {
        console.error("❌ Error converting server menu:", error);
        return getDefaultLinks();
      }
    },
    [getDefaultLinks]
  );

  // Gunakan useMemo untuk menghitung links
  const links = useMemo(() => {
    // Tampilkan loading state
    if (loading) {
      console.log("⏳ Still loading, showing empty");
      return [];
    }

    // Pastikan serverMenu adalah array yang valid
    const validMenu = Array.isArray(serverMenu) ? serverMenu : [];
    return convertServerMenuToSidebarFormat(validMenu);
  }, [serverMenu, loading, convertServerMenuToSidebarFormat]);

  const isActive = useCallback(
    (href: string, exact: boolean = false) => {
      if (!href || href === "#") return false;
      if (exact) {
        return pathname === href;
      }
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname]
  );

  // Fungsi untuk mengecek apakah submenu aktif
  const isSubmenuActive = useCallback(
    (submenuItems: SubmenuItem[] | undefined): boolean => {
      if (!submenuItems || !Array.isArray(submenuItems)) return false;
      return submenuItems.some((item) => item.href && isActive(item.href));
    },
    [isActive]
  );

  // Tampilkan loading state
  if (loading) {
    return (
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col z-40 transition-all duration-300",
          open ? "w-64" : "w-16"
        )}
      >
        <div
          className={cn(
            "shrink-0 border-b border-gray-100 bg-white z-50 flex items-center",
            open ? "px-6" : "px-4"
          )}
          style={{ height: "64px" }}
        >
          <div className="flex items-center justify-center h-full w-full">
            <div className="animate-pulse bg-gray-200 rounded w-32 h-8"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <div className="space-y-2 px-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "animate-pulse bg-gray-200 rounded-lg",
                  open ? "h-10 mx-3" : "h-10 mx-1"
                )}
              />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col z-40 transition-all duration-300",
        open ? "w-64" : "w-16"
      )}
    >
      <div
        className={cn(
          "shrink-0 border-b border-gray-100 bg-white z-50 flex items-center",
          open ? "px-6" : "px-4"
        )}
        style={{ height: "64px" }}
      >
        <div className="flex items-center justify-center h-full w-full">
          <Image
            src="/logo.png"
            alt="Logo"
            width={open ? 96 : 28}
            height={28}
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <nav className="space-y-2 px-2">
          {links.length === 0
            ? // Fallback jika tidak ada menu
              getDefaultLinks().map((link) => {
                const Icon = link.icon;

                if ("submenu" in link) {
                  const isSubmenuOpen = openSubmenu === link.title;
                  const hasActiveChild = isSubmenuActive(link.submenu);

                  return (
                    <div key={link.title} className="relative">
                      <button
                        onClick={() => toggleSubmenu(getSafeTitle(link.title))}
                        className={cn(
                          "flex items-center rounded-lg transition-all duration-150 w-full",
                          open
                            ? "gap-3 px-3 py-2.5 justify-between"
                            : "justify-center py-2.5 px-1",
                          hasActiveChild
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="w-5 h-5 shrink-0" />
                          {open && (
                            <span className="whitespace-nowrap truncate text-sm">
                              {link.title}
                            </span>
                          )}
                        </div>
                        {open &&
                          (isSubmenuOpen ? (
                            <ChevronDown className="w-4 h-4 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 shrink-0" />
                          ))}
                      </button>

                      {open && isSubmenuOpen && (
                        <div className="mt-1 ml-2 pl-8 space-y-1 border-l border-gray-200">
                          {link.submenu.map((subItem) => {
                            const isSubItemActive = isActive(subItem.href);

                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm",
                                  isSubItemActive
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
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

                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center rounded-lg transition-all duration-150",
                      open ? "gap-3 px-3 py-2.5" : "justify-center py-2.5 px-1",
                      active
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {open && (
                      <span className="whitespace-nowrap truncate text-sm">
                        {link.label}
                      </span>
                    )}
                  </Link>
                );
              })
            : // Render menu dari server
              links.map((link) => {
                const Icon = link.icon;

                const isParentMenuItem = (
                  item: SidebarMenuItem
                ): item is ParentMenuItem => {
                  return "submenu" in item;
                };

                if (isParentMenuItem(link)) {
                  const safeTitle = getSafeTitle(link.title);
                  const isSubmenuOpen = openSubmenu === safeTitle;
                  const hasActiveChild = isSubmenuActive(link.submenu);

                  // Jika menu parent punya href sendiri
                  if (link.href && link.href !== "#") {
                    const active = isActive(getSafeHref(link.href));

                    return (
                      <div key={safeTitle} className="relative">
                        <Link
                          href={getSafeHref(link.href)}
                          className={cn(
                            "flex items-center rounded-lg transition-all duration-150 w-full",
                            open
                              ? "gap-3 px-3 py-2.5 justify-between"
                              : "justify-center py-2.5 px-1",
                            active || hasActiveChild
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className="w-5 h-5 shrink-0" />
                            {open && (
                              <span className="whitespace-nowrap truncate text-sm">
                                {safeTitle}
                              </span>
                            )}
                          </div>
                          {open && link.submenu && link.submenu.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSubmenu(safeTitle);
                              }}
                              className="shrink-0 p-1 hover:bg-gray-200 rounded"
                            >
                              {isSubmenuOpen ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </Link>

                        {open &&
                          link.submenu &&
                          link.submenu.length > 0 &&
                          isSubmenuOpen && (
                            <div className="mt-1 ml-2 pl-8 space-y-1 border-l border-gray-200">
                              {link.submenu.map((subItem) => {
                                const safeSubItemHref = getSafeHref(
                                  subItem.href
                                );
                                const isSubItemActive =
                                  isActive(safeSubItemHref);

                                return (
                                  <Link
                                    key={safeSubItemHref}
                                    href={safeSubItemHref}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm",
                                      isSubItemActive
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
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

                  // Menu parent tanpa href sendiri (hanya submenu)
                  return (
                    <div key={safeTitle} className="relative">
                      <button
                        onClick={() => toggleSubmenu(safeTitle)}
                        className={cn(
                          "flex items-center rounded-lg transition-all duration-150 w-full",
                          open
                            ? "gap-3 px-3 py-2.5 justify-between"
                            : "justify-center py-2.5 px-1",
                          hasActiveChild
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="w-5 h-5 shrink-0" />
                          {open && (
                            <span className="whitespace-nowrap truncate text-sm">
                              {safeTitle}
                            </span>
                          )}
                        </div>
                        {open &&
                          link.submenu &&
                          link.submenu.length > 0 &&
                          (isSubmenuOpen ? (
                            <ChevronDown className="w-4 h-4 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 shrink-0" />
                          ))}
                      </button>

                      {open &&
                        link.submenu &&
                        link.submenu.length > 0 &&
                        isSubmenuOpen && (
                          <div className="mt-1 ml-2 pl-8 space-y-1 border-l border-gray-200">
                            {link.submenu.map((subItem) => {
                              const safeSubItemHref = getSafeHref(subItem.href);
                              const isSubItemActive = isActive(safeSubItemHref);

                              return (
                                <Link
                                  key={safeSubItemHref}
                                  href={safeSubItemHref}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm",
                                    isSubItemActive
                                      ? "bg-blue-50 text-blue-600 font-medium"
                                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                  )}
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
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

                // Regular menu item
                const safeHref = getSafeHref(link.href);
                const active = isActive(safeHref);

                return (
                  <Link
                    key={safeHref}
                    href={safeHref}
                    className={cn(
                      "flex items-center rounded-lg transition-all duration-150",
                      open ? "gap-3 px-3 py-2.5" : "justify-center py-2.5 px-1",
                      active
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {open && (
                      <span className="whitespace-nowrap truncate text-sm">
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
