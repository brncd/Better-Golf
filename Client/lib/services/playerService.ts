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

  // Get player by ID
  getById: (id: string): Promise<SinglePlayerDTO> =>
    apiClient.get(`/api/Players/${id}`),

  // Create new player (Admin only)
  create: (player: PlayerPostDTO): Promise<SinglePlayerDTO> =>
    apiClient.post('/api/Players', player),

  // Update player (Player/Admin)
  update: (id: string, player: PlayerPostDTO): Promise<void> =>
    apiClient.put(`/api/Players/${id}`, player),

  // Delete player (Admin only)
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/Players/${id}`),

  // Get player tournaments
  getTournaments: (id: string, pagination?: PaginationRequest): Promise<PaginationResponse<any>> =>
    apiClient.get(`/api/Players/${id}/Tournaments?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Create player profile for current user
  createProfile: (player: PlayerPostDTO): Promise<SinglePlayerDTO> =>
    apiClient.post('/api/me/player-profile', player),

  // Get current user's player profile
  getMyProfile: (): Promise<PlayerProfileDTO> =>
    apiClient.get('/api/me/player-profile'),

  // Update current user's player profile
  updateMyProfile: (profile: Partial<PlayerProfileDTO>): Promise<PlayerProfileDTO> =>
    apiClient.put('/api/me/player-profile', profile),
};
