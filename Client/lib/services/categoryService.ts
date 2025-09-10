import { apiClient } from '../apiService';
import type { 
  CategoryDTO, 
  CategoryPostDTO,
  PaginationRequest, 
  PaginationResponse 
} from '@/types';

export const categoryService = {
  // Get all categories with pagination
  getAll: (pagination?: PaginationRequest): Promise<PaginationResponse<CategoryDTO>> =>
    apiClient.get(`/api/Categories?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Get category by ID
  getById: (id: string): Promise<CategoryDTO> =>
    apiClient.get(`/api/Categories/${id}`),

  // Create new category (Admin only)
  create: (category: CategoryPostDTO): Promise<CategoryDTO> =>
    apiClient.post('/api/Categories', category),

  // Update category (Admin only)
  update: (id: string, category: CategoryPostDTO): Promise<void> =>
    apiClient.put(`/api/Categories/${id}`, category),

  // Delete category (Admin only)
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/Categories/${id}`),

  // Get category players
  getPlayers: (id: string, pagination?: PaginationRequest): Promise<PaginationResponse<any>> =>
    apiClient.get(`/api/Categories/${id}/Players?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Add player to category (TournamentOrganizer/Admin)
  addPlayer: (categoryId: string, playerId: string): Promise<any> =>
    apiClient.post(`/api/Categories/${categoryId}/Players/${playerId}`, {}),

  // Remove player from category (TournamentOrganizer/Admin)
  removePlayer: (categoryId: string, playerId: string): Promise<void> =>
    apiClient.delete(`/api/Categories/${categoryId}/Players/${playerId}`),

  // Set open course for category (Admin only)
  setOpenCourse: (categoryId: string, courseId: string): Promise<void> =>
    apiClient.post(`/api/Categories/${categoryId}/SetOpenCourse/${courseId}`, {}),

  // Set ladies course for category (Admin only)
  setLadiesCourse: (categoryId: string, courseId: string): Promise<void> =>
    apiClient.post(`/api/Categories/${categoryId}/SetLadiesCourse/${courseId}`, {}),
};
