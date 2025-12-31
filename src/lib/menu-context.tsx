"use client";
import { ApiResponse } from "./api";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import {
  Menu,
  RoleMenu,
  AssignMenuDto,
  menuApi,
  CreateMenuDto,
} from "./api-menu";

interface MenuContextType {
  menus: Menu[];
  userMenus: Menu[];
  loading: boolean;
  error: string | null;
  fetchMenus: () => Promise<void>;
  fetchUserMenus: () => Promise<void>;
  createMenu: (data: CreateMenuDto) => Promise<ApiResponse<Menu>>;
  getMenuByRole: (roleName: string) => Promise<Menu[]>;
  assignMenuToRole: (data: AssignMenuDto) => Promise<ApiResponse<RoleMenu>>;
  hasMenuAccess: (path: string) => boolean;
  checkPermission: (
    path: string,
    permission: "view" | "create" | "edit" | "delete" | "export"
  ) => boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [userMenus, setUserMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = async () => {
    try {
      setError(null);
      const response = await menuApi.getAll();
      if (response.success && response.data) {
        setMenus(response.data);
      } else {
        setError(response.error || "Gagal mengambil data menu");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
      console.error("Failed to fetch menus:", error);
    }
  };

  const fetchUserMenus = async () => {
    try {
      setError(null);
      setLoading(true);

      // Menggunakan endpoint /menu/my-menu yang tersedia
      const response = await menuApi.getMyMenus();

      if (response.success && response.data) {
        setUserMenus(response.data);
      } else {
        // Jika endpoint gagal, gunakan fallback untuk development
        if (process.env.NODE_ENV === "development") {
          console.warn("Using fallback menus for development");
          const fallbackMenus: Menu[] = [
            {
              id: 1,
              name: "Dashboard",
              icon: "Home",
              path: "/dashboard",
              order: 1,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              name: "Santri",
              icon: "Users",
              path: "/santri",
              order: 2,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 3,
              name: "Tagihan",
              icon: "DollarSign",
              path: "/tagihan",
              order: 3,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 4,
              name: "Tabungan",
              icon: "PiggyBank",
              path: "/tabungan",
              order: 4,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 5,
              name: "Keuangan",
              icon: "DollarSign",
              path: "/finance",
              order: 5,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 6,
              name: "PPDB",
              icon: "FileText",
              path: "/ppdb",
              order: 6,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 7,
              name: "Kantin",
              icon: "CookingPot",
              path: "/kantin",
              order: 7,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 8,
              name: "Audit Trail",
              icon: "History",
              path: "/audit",
              order: 8,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 9,
              name: "Akademik",
              icon: "GraduationCap",
              path: "/academic",
              order: 9,
              parentId: undefined,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 10,
              name: "Absensi",
              icon: "ClipboardCheck",
              path: "/academic/attendance",
              order: 1,
              parentId: 9,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 11,
              name: "Konseling",
              icon: "Users",
              path: "/counseling",
              order: 10,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 12,
              name: "Tahfidz",
              icon: "Book",
              path: "/tahfidz",
              order: 11,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 13,
              name: "Manajemen Menu",
              icon: "Menu",
              path: "/menu",
              order: 12,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          setUserMenus(fallbackMenus);
        } else {
          setError(response.error || "Gagal mengambil menu user");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user menus:", error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const createMenu = async (data: CreateMenuDto) => {
    return await menuApi.create(data);
  };

  const getMenuByRole = async (roleName: string) => {
    const response = await menuApi.getByRole(roleName);
    return response.success ? response.data || [] : [];
  };

  const assignMenuToRole = async (data: AssignMenuDto) => {
    return await menuApi.assignMenuToRole(data);
  };

  const hasMenuAccess = (path: string) => {
    // Jika belum ada data, beri akses sementara
    if (userMenus.length === 0) return true;

    // Normalize path
    const normalizedPath = path.split("?")[0];

    // Cek exact match
    const exactMatch = userMenus.find((m) => m.path === normalizedPath);
    if (exactMatch) return true;

    // Cek untuk parent-child relationship
    // Jika path seperti /academic/attendance/create, cek apakah ada parent /academic
    const pathParts = normalizedPath.split("/").filter((p) => p);

    // Coba cari parent menu
    for (let i = pathParts.length; i > 0; i--) {
      const testPath = "/" + pathParts.slice(0, i).join("/");
      const parentMenu = userMenus.find((m) => m.path === testPath);
      if (parentMenu) return true;
    }

    return false;
  };

  const checkPermission = (
    path: string,
    permission: "view" | "create" | "edit" | "delete" | "export"
  ) => {
    // Untuk sekarang, semua user yang memiliki akses ke menu bisa melakukan semua aksi
    // Di implementasi real, ini akan dicek dari role menu assignments
    return hasMenuAccess(path);
  };

  useEffect(() => {
    fetchUserMenus();

    // Fetch all menus hanya jika user adalah admin
    // Dalam implementasi real, cek role user dulu
    const checkAndFetchMenus = async () => {
      try {
        // Di sini bisa cek token atau user role
        // Untuk sekarang, kita fetch semua menu
        await fetchMenus();
      } catch (error) {
        console.error("Failed to fetch admin menus:", error);
      }
    };

    checkAndFetchMenus();
  }, []);

  return (
    <MenuContext.Provider
      value={{
        menus,
        userMenus,
        loading,
        error,
        fetchMenus,
        fetchUserMenus,
        createMenu,
        getMenuByRole,
        assignMenuToRole,
        hasMenuAccess,
        checkPermission,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
