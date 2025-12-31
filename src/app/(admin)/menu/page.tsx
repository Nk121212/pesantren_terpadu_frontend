"use client";

import { useState, useEffect } from "react";
import { Menu, menuApi } from "@/lib/api";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Menu as MenuIcon,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Shield,
} from "lucide-react";

type MenuWithoutChildren = Omit<Menu, "children"> & {
  level: number;
};

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState<Menu[]>([]);

  const fetchMenus = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await menuApi.getAll();

      if (response.success && response.data) {
        // Simpan data original untuk reference
        setOriginalData(response.data);

        // Flatten the nested structure correctly
        const flattenedMenus = flattenMenuData(response.data);
        console.log("Fetched original data:", response.data);
        console.log("Flattened menus:", flattenedMenus);
        setMenus(flattenedMenus);
      } else {
        console.error("Failed to fetch menus:", response.error);
      }
    } catch (error) {
      console.error("Failed to fetch menus:", error);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const flattenMenuData = (menuData: Menu[]): MenuWithoutChildren[] => {
    const result: MenuWithoutChildren[] = [];

    const flatten = (menus: Menu[], level = 0) => {
      menus.forEach((menu) => {
        const { children, ...rest } = menu;

        result.push({
          ...rest,
          level,
        });

        if (children && children.length > 0) {
          flatten(children, level + 1);
        }
      });
    };

    flatten(menuData);
    return result;
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const toggleFolder = (menuId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;

    try {
      setDeleteLoading(id);
      const response = await menuApi.delete(id);

      if (response.success) {
        await fetchMenus();
        alert("Menu berhasil dihapus");
      } else {
        alert(response.error || "Gagal menghapus menu");
      }
    } catch (error) {
      console.error("Failed to delete menu:", error);
      alert("Gagal menghapus menu. Silakan coba lagi.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getChildMenus = (parentId: number | null): Menu[] => {
    return menus.filter((menu) => menu.parentId === parentId);
  };

  // Fungsi rekursif untuk render tree
  const renderMenuTree = (
    parentId: number | null = null,
    level = 0
  ): ReactNode[] => {
    const items = getChildMenus(parentId);

    console.log(
      `Rendering level ${level}, parentId: ${parentId}, found ${items.length} items`
    );

    if (items.length === 0 && level === 0) {
      // Jika tidak ada menu sama sekali
      return [
        <div key="no-data" className="text-center py-12">
          <MenuIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Belum ada menu</p>
          <p className="text-sm text-gray-400 mt-1">
            Mulai dengan membuat menu baru
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Link
              href="/menu/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Tambah Menu
            </Link>
            <button
              onClick={() => fetchMenus(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>,
      ];
    }

    return items.map((menu) => {
      const childMenus = getChildMenus(menu.id);
      const hasChildren = childMenus.length > 0;
      const isExpanded = expandedFolders.has(menu.id);

      return (
        <div key={menu.id} className="space-y-1">
          <div
            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
              level === 0 ? "bg-gray-50" : ""
            }`}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleFolder(menu.id)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}

            <div className="flex items-center gap-2">
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                ) : (
                  <Folder className="w-4 h-4 text-blue-600" />
                )
              ) : (
                <MenuIcon className="w-4 h-4 text-gray-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 truncate">
                  {menu.name}
                </span>
                {!menu.isActive && (
                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                    Nonaktif
                  </span>
                )}
                {menu.parentId && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Child
                  </span>
                )}
                {!menu.parentId && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                    Parent
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                {menu.path && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">{menu.path}</span>
                  </div>
                )}

                {menu.icon && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Icon:</span>
                    <span className="font-medium">{menu.icon}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <span className="text-xs">Order:</span>
                  <span className="font-medium">{menu.order}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs">ID:</span>
                  <span className="font-medium">{menu.id}</span>
                </div>

                {menu.parentId && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Parent:</span>
                    <span className="font-medium">{menu.parentId}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                {menu.isActive ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <Link
                  href={`/menu/${menu.id}/edit`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(menu.id)}
                  disabled={deleteLoading === menu.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  title="Hapus"
                >
                  {deleteLoading === menu.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="ml-4">{renderMenuTree(menu.id, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  // Calculate stats - FIXED dengan data yang benar
  const stats = {
    total: menus.length,
    active: menus.filter((m) => m.isActive).length,
    inactive: menus.filter((m) => !m.isActive).length,
    parent: menus.filter((m) => !m.parentId).length,
    child: menus.filter((m) => m.parentId).length,
  };

  // Tampilkan semua menu untuk debugging
  const displayAllMenus = () => {
    return menus.map((menu) => (
      <div key={menu.id} className="flex items-center gap-4 p-3 border-b">
        <div>
          <p className="font-medium">ID: {menu.id}</p>
          <p>Name: {menu.name}</p>
          <p>Parent ID: {menu.parentId || "null"}</p>
          <p>Path: {menu.path || "-"}</p>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MenuIcon className="w-7 h-7 text-green-600" />
            Manajemen Menu
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola struktur menu dan hak akses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchMenus(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <Link
            href="/menu/assign"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Shield className="w-4 h-4" />
            Tetapkan ke Role
          </Link>
          <Link
            href="/menu/create"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Menu
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Menu</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <MenuIcon className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Menu Aktif</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.active}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Menu Utama</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.parent}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Folder className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sub Menu</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.child}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-4 md:px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Struktur Menu
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{stats.total}</span> menu
                ditemukan
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    Aktif ({stats.active})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    Nonaktif ({stats.inactive})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 min-h-[400px]">
          {menus.length === 0 ? (
            <div className="text-center py-12">
              <MenuIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada menu</p>
              <p className="text-sm text-gray-400 mt-1">
                Mulai dengan membuat menu baru
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Link
                  href="/menu/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Menu
                </Link>
                <button
                  onClick={() => fetchMenus(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Table Header for Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="col-span-5">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Menu
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Detail
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Aksi
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              {renderMenuTree()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
