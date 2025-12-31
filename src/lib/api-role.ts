import {
  apiFetch,
  buildQueryString,
  ApiResponse,
  PaginatedResponse,
} from "./api-core";

/* =======================
   ROLE TYPES
======================= */

export interface Role {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: number;
  role: string;
  menuId: number;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  menu?: {
    id: number;
    name: string;
    path: string;
  };
}

export interface RoleUser {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  role: string;
}

export interface RoleMenu {
  id: number;
  name: string;
  path: string;
  icon: string;
  parentId: number | null;
  order: number;
  isActive: boolean;
}

export interface UpdateRoleDto {
  description: string;
}

export interface AssignPermissionDto {
  role: string;
  menuId: number;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

/* =======================
   ROLE API FUNCTIONS
======================= */

export const roleApi = {
  // 1. GET All Roles
  getAll: async (): Promise<ApiResponse<Role[]>> => {
    return apiFetch<Role[]>("/roles");
  },

  // 2. GET Role by Name
  getByName: async (roleName: string): Promise<ApiResponse<Role>> => {
    return apiFetch<Role>(`/roles/${roleName}`);
  },

  // 3. UPDATE Role Description
  update: async (
    roleName: string,
    data: UpdateRoleDto
  ): Promise<ApiResponse<Role>> => {
    return apiFetch<Role>(`/roles/${roleName}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // 4. ASSIGN Permissions
  assignPermission: async (
    data: AssignPermissionDto
  ): Promise<ApiResponse<RolePermission>> => {
    return apiFetch<RolePermission>("/roles/assign-permissions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 5. REMOVE Permissions
  removePermission: async (
    roleName: string,
    menuId: number
  ): Promise<ApiResponse<void>> => {
    return apiFetch(`/roles/${roleName}/permissions/${menuId}`, {
      method: "DELETE",
    });
  },

  // 6. GET Role Permissions
  getPermissions: async (
    roleName: string
  ): Promise<ApiResponse<RolePermission[]>> => {
    return apiFetch<RolePermission[]>(`/roles/${roleName}/permissions`);
  },

  // 7. GET Users by Role
  getUsersByRole: async (
    roleName: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<RoleUser>>> => {
    const query = buildQueryString(params);
    return apiFetch<PaginatedResponse<RoleUser>>(
      `/roles/${roleName}/users${query}`
    );
  },

  // 8. GET Menus by Role
  getMenusByRole: async (
    roleName: string
  ): Promise<ApiResponse<RoleMenu[]>> => {
    return apiFetch<RoleMenu[]>(`/roles/${roleName}/menus`);
  },

  // 9. Create new role (if needed)
  create: async (
    name: string,
    description?: string
  ): Promise<ApiResponse<Role>> => {
    return apiFetch<Role>("/roles", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  },

  // 10. Delete role (if needed)
  delete: async (roleName: string): Promise<ApiResponse<void>> => {
    return apiFetch(`/roles/${roleName}`, {
      method: "DELETE",
    });
  },
};
