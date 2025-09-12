import { apiClient } from '../apiService';
import type { 
  PlayerListGetDTO, 
  SinglePlayerDTO, 
  PlayerPostDTO, 
  PlayerProfileDTO,
  PaginationRequest, 
  PaginationResponse 
} from '@/types';

export const playerService = {
  // Get all players with pagination
  getAll: (pagination?: PaginationRequest): Promise<PaginationResponse<PlayerListGetDTO>> =>
    apiClient.get(`/api/Players?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Get player by ID - Fixed: API uses int IDs, not string
  getById: (id: number): Promise<SinglePlayerDTO> =>
    apiClient.get(`/api/Players/${id}`),

  // Create new player (Admin only)
  create: (player: PlayerPostDTO): Promise<SinglePlayerDTO> =>
    apiClient.post('/api/Players', player),

  // Update player (Player/Admin) - Fixed: API uses int IDs, not string
  update: (id: number, player: PlayerPostDTO): Promise<void> =>
    apiClient.put(`/api/Players/${id}`, player),

  // Delete player (Admin only) - Fixed: API uses int IDs, not string
  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/Players/${id}`),

  // Get player tournaments - Fixed: API uses int IDs, not string
  getTournaments: (id: number, pagination?: PaginationRequest): Promise<PaginationResponse<any>> =>
    apiClient.get(`/api/Players/${id}/Tournaments?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Create player profile for current user
  createProfile: (player: PlayerPostDTO): Promise<SinglePlayerDTO> =>
    apiClient.post('/api/me/player-profile', player),
};
