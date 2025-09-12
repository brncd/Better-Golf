import { apiClient } from '../apiService';

export interface RoleAssignmentDTO {
  roleName: string;
}

export interface UserWithRoles {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export const roleService = {
  // Create a new role (Admin only)
  createRole: (roleName: string): Promise<string> =>
    apiClient.post(`/api/roles/${roleName}`, {}),

  // Assign role to user (Admin only)
  assignRole: (userId: string, roleAssignment: RoleAssignmentDTO): Promise<string> =>
    apiClient.post(`/api/users/${userId}/roles`, roleAssignment),

  // Remove role from user (Admin only)
  removeRole: (userId: string, roleName: string): Promise<void> =>
    apiClient.delete(`/api/users/${userId}/roles/${roleName}`),

  // Get user roles (Admin only)
  getUserRoles: (userId: string): Promise<string[]> =>
    apiClient.get(`/api/users/${userId}/roles`),

  // Get all users (this would need to be implemented in the API)
  getAllUsers: (): Promise<UserWithRoles[]> =>
    apiClient.get('/api/users'),
};
