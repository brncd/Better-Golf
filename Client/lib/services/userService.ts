import { apiClient } from '../apiService';
import type { RoleAssignmentDTO, User } from '@/types';

export const userService = {
  // Get all user role assignments
  async getRoleAssignments(): Promise<RoleAssignmentDTO[]> {
    return await apiClient.get<RoleAssignmentDTO[]>('/api/admin/roles');
  },

  // Update user role
  async updateUserRole(userId: string, role: string): Promise<void> {
    await apiClient.put(`/api/admin/users/${userId}/role`, { role });
  },

  // Get all users (for admin)
  async getAllUsers(): Promise<User[]> {
    return await apiClient.get<User[]>('/api/admin/users');
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    return await apiClient.get<User>(`/api/admin/users/${userId}`);
  },

  // Deactivate user
  async deactivateUser(userId: string): Promise<void> {
    await apiClient.put(`/api/admin/users/${userId}/deactivate`, {});
  },

  // Activate user
  async activateUser(userId: string): Promise<void> {
    await apiClient.put(`/api/admin/users/${userId}/activate`, {});
  }
};
