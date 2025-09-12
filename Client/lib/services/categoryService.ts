import { apiClient } from '../apiService';
import type { 
  CategoryListGetDTO, 
  CategoryPostDTO,
  SingleCategoryDTO,
  PaginationRequest, 
  PaginationResponse 
} from '@/types';

export const categoryService = {
  // Get all categories with pagination
  getAll: (pagination?: PaginationRequest): Promise<PaginationResponse<CategoryListGetDTO>> =>
    apiClient.get(`/api/Categories?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Get category by ID - Fixed: API uses number IDs, not string
  getById: (id: number): Promise<SingleCategoryDTO> =>
    apiClient.get(`/api/Categories/${id}`),

  // Create new category (Admin only)
  create: (category: CategoryPostDTO): Promise<SingleCategoryDTO> =>
    apiClient.post('/api/Categories', category),

  // Update category (Admin only) - Fixed: API uses number IDs
  update: (id: number, category: CategoryPostDTO): Promise<void> =>
    apiClient.put(`/api/Categories/${id}`, category),

  // Delete category (Admin only) - Fixed: API uses number IDs
  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/Categories/${id}`),

  // Get category players - Fixed: Category ID is number
  getPlayers: (id: number, pagination?: PaginationRequest): Promise<PaginationResponse<any>> =>
    apiClient.get(`/api/Categories/${id}/Players?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Add player to category (TournamentOrganizer/Admin) - Fixed: Both IDs are numbers
  addPlayer: (categoryId: number, playerId: number): Promise<any> =>
    apiClient.post(`/api/Categories/${categoryId}/Players/${playerId}`, {}),

  // Remove player from category (TournamentOrganizer/Admin) - Fixed: Both IDs are numbers
  removePlayer: (categoryId: number, playerId: number): Promise<void> =>
    apiClient.delete(`/api/Categories/${categoryId}/Players/${playerId}`),

  // Set open course for category (Admin only) - Fixed: Both IDs are numbers
  setOpenCourse: (categoryId: number, courseId: number): Promise<void> =>
    apiClient.post(`/api/Categories/${categoryId}/SetOpenCourse/${courseId}`, {}),

  // Set ladies course for category (Admin only) - Fixed: Both IDs are numbers
  setLadiesCourse: (categoryId: number, courseId: number): Promise<void> =>
    apiClient.post(`/api/Categories/${categoryId}/SetLadiesCourse/${courseId}`, {}),
};
