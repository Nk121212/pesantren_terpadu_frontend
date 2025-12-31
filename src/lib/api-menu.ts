import { apiFetch, type ApiResponse } from "./api-core";

export interface Menu {
  id: number;
  name: string;
  icon?: string;
  path?: string;
  order: number;
  parentId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  children?: Menu[];
  parent?: Menu;
  roleMenus?: RoleMenu[];
  permissions?: RoleMenu; // permissions adalah single RoleMenu object
}

export interface CreateMenuDto {
  name: string;
  icon?: string;
  path?: string;
  order?: number;
  parentId?: number;
  isActive?: boolean;
}

export interface UpdateMenuDto {
  name?: string;
  icon?: string;
  path?: string;
  order?: number;
  parentId?: number;
  isActive?: boolean;
}

export interface AssignMenuDto {
  role: string; // Role name seperti "TEACHER", "ADMIN", "SUPERADMIN"
  menuId: number;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

// Role type (dari response API)
export interface Role {
  id?: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleMenu {
  id: number;
  role: string;
  menuId: number;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  createdAt: string;
  updatedAt: string;
}

export const menuApi = {
  // ==================== MENU ENDPOINTS ====================

  /**
   * Create Menu (Admin/Superadmin)
   * POST /menu
   */
  create: async (data: CreateMenuDto): Promise<ApiResponse<Menu>> => {
    try {
      const res = await apiFetch<Menu>("/menu", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res;
    } catch (error) {
      console.error("Error creating menu:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat menu",
      };
    }
  },

  getAll: async (params?: {
    parentId?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse<Menu[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.parentId !== undefined)
        queryParams.append("parentId", params.parentId.toString());
      if (params?.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params?.search) queryParams.append("search", params.search);

      const queryString = queryParams.toString();
      const res = await apiFetch<Menu[]>(
        `/menu${queryString ? `?${queryString}` : ""}`,
        {
          method: "GET",
        }
      );
      return res;
    } catch (error) {
      console.error("Error fetching menus:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil data menu",
      };
    }
  },

  /**
   * Get My Menu (All Authenticated Users)
   * GET /menu/my-menu
   */
  getMyMenus: async (): Promise<ApiResponse<Menu[]>> => {
    try {
      const res = await apiFetch<Menu[]>("/menu/my-menu", {
        method: "GET",
      });
      return res;
    } catch (error) {
      console.error("Error fetching my menus:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil menu user",
      };
    }
  },

  /**
   * Get Menu by Role (Admin/Superadmin)
   * GET /menu/role/:roleName
   */
  getByRole: async (roleName: string): Promise<ApiResponse<Menu[]>> => {
    try {
      const res = await apiFetch<Menu[]>(`/menu/role/${roleName}`, {
        method: "GET",
      });
      return res;
    } catch (error) {
      console.error("Error fetching menus by role:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil menu berdasarkan role",
      };
    }
  },

  // ==================== ROLE MENU ASSIGNMENT ====================

  /**
   * Assign Menu to Role (Superadmin)
   * POST /menu/assign
   */
  assignMenuToRole: async (
    data: AssignMenuDto
  ): Promise<ApiResponse<RoleMenu>> => {
    try {
      const res = await apiFetch<RoleMenu>("/menu/assign", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res;
    } catch (error) {
      console.error("Error assigning menu to role:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal menetapkan menu ke role",
      };
    }
  },

  // ==================== HELPER METHODS ====================

  /**
   * Get single menu by ID
   */
  get: async (id: number): Promise<ApiResponse<Menu>> => {
    try {
      // Note: Endpoint spesifik untuk single menu tidak ada di collection
      // Jadi kita fetch semua dan filter
      const res = await menuApi.getAll();
      if (res.success && res.data) {
        const menu = res.data.find((m) => m.id === id);
        if (menu) {
          return { success: true, data: menu };
        }
      }
      return {
        success: false,
        error: "Menu tidak ditemukan",
      };
    } catch (error) {
      console.error("Error fetching menu:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil data menu",
      };
    }
  },

  /**
   * Update menu
   */
  update: async (
    id: number,
    data: UpdateMenuDto
  ): Promise<ApiResponse<Menu>> => {
    try {
      // Note: Endpoint update tidak ada di collection
      // Jadi kita mock untuk development
      console.warn("Update menu endpoint not available in API");
      return {
        success: false,
        error: "Update menu endpoint belum tersedia",
      };
    } catch (error) {
      console.error("Error updating menu:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengupdate menu",
      };
    }
  },

  /**
   * Delete menu
   */
  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
      // Note: Endpoint delete tidak ada di collection
      console.warn("Delete menu endpoint not available in API");
      return {
        success: false,
        error: "Delete menu endpoint belum tersedia",
      };
    } catch (error) {
      console.error("Error deleting menu:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus menu",
      };
    }
  },
};
