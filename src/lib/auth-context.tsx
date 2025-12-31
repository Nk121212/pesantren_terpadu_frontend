"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getUserProfile, logoutUser } from "./auth";
import type { Menu, RoleMenu } from "./api-menu";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  menu: Menu[];
  setMenu: React.Dispatch<React.SetStateAction<Menu[]>>;
}

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

interface RawMenuItem {
  id: number;
  name: string;
  icon?: string;
  path?: string;
  order?: number;
  parentId?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  children?: RawMenuItem[];
  roleMenus?: RoleMenu[];
  permissions?: RoleMenu | null;
}

const parseMenuData = (menuData: RawMenuItem[]): Menu[] => {
  if (!Array.isArray(menuData)) return [];

  return menuData.map(
    (item): Menu => ({
      id: item.id,
      name: item.name,
      icon: item.icon ?? "",
      path: item.path ?? "",
      order: item.order ?? 0,
      parentId: item.parentId ?? undefined,
      isActive: item.isActive ?? true,
      createdAt: item.createdAt ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? new Date().toISOString(),
      children: item.children ? parseMenuData(item.children) : [],
      roleMenus: item.roleMenus || [],
      permissions: item.permissions ?? undefined,
    })
  );
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [menu, setMenu] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        const cachedMenu = localStorage.getItem("menu");
        if (cachedMenu) {
          try {
            const parsedMenu = JSON.parse(cachedMenu) as RawMenuItem[];
            if (Array.isArray(parsedMenu)) {
              setMenu(parseMenuData(parsedMenu));
            }
          } catch (e) {
            console.error("Failed to parse cached menu:", e);
          }
        }

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await getUserProfile();
        console.log("auth-context response:", res);

        if (res?.success && res?.data) {
          // Handle the typed response properly
          const responseData = res.data as unknown as Record<string, unknown>;
          const userData = responseData.user as User | undefined;
          const menuData = responseData.menu as RawMenuItem[] | undefined;

          if (userData) {
            setUser(userData);
          }

          if (Array.isArray(menuData)) {
            const parsedMenu = parseMenuData(menuData);
            console.log("Parsed menu:", parsedMenu);
            setMenu(parsedMenu);
            localStorage.setItem("menu", JSON.stringify(parsedMenu));
          } else {
            console.log("Menu is not an array:", menuData);
            setMenu([]);
          }
        } else {
          setUser(null);
          setMenu([]);
          localStorage.removeItem("menu");
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        setUser(null);
        setMenu([]);
        localStorage.removeItem("menu");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextProps = useMemo(
    () => ({
      user,
      loading,
      logout: logoutUser,
      setUser,
      menu,
      setMenu,
    }),
    [user, loading, menu]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextProps {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
