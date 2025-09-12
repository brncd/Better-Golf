import { apiClient } from '../apiService';
import type { 
  TournamentListGetDTO, 
  SingleTournamentDTO, 
  TournamentPostDTO, 
  TournamentRankingDTO,
  TournamentType,
  RoundInfo,
  PaginationRequest, 
  PaginationResponse 
} from '@/types';

export const tournamentService = {
  // Get all tournaments with pagination
  getAll: (pagination?: PaginationRequest): Promise<PaginationResponse<TournamentListGetDTO>> =>
    apiClient.get(`/api/Tournaments?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Get tournament by ID - Fixed: API uses number IDs, not string
  getById: (id: number): Promise<SingleTournamentDTO> =>
    apiClient.get(`/api/Tournaments/${id}`),

  // Create new tournament (TournamentOrganizer/Admin)
  create: (tournament: TournamentPostDTO): Promise<SingleTournamentDTO> =>
    apiClient.post('/api/Tournaments', tournament),

  // Update tournament (TournamentOrganizer/Admin) - Fixed: API uses number IDs
  update: (id: number, tournament: TournamentPostDTO): Promise<void> =>
    apiClient.put(`/api/Tournaments/${id}`, tournament),

  // Delete tournament (Admin/TournamentOrganizer only) - Fixed: API uses number IDs
  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/Tournaments/${id}`),

  // Check if current user is registered for tournament - Fixed: Tournament ID is number
  checkRegistration: (tournamentId: number): Promise<{ isRegistered: boolean; playerId?: number }> =>
    apiClient.get(`/api/Tournaments/${tournamentId}/registration-status`),

  // Set tournament status (TournamentOrganizer/Admin) - Fixed: Tournament ID is number
  setStatus: (id: number, status: string): Promise<void> =>
    apiClient.put(`/api/Tournaments/${id}/status`, status),

  // Register current user to tournament (Player) - Fixed: Tournament ID is number
  register: (tournamentId: number): Promise<any> =>
    apiClient.post(`/api/tournaments/${tournamentId}/register`, {}),

  // Get tournament players - Fixed: Tournament ID is number
  getPlayers: (id: number, pagination?: PaginationRequest): Promise<PaginationResponse<any>> =>
    apiClient.get(`/api/Tournaments/${id}/Players?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Add player to tournament (TournamentOrganizer/Admin) - Fixed: Both IDs are numbers
  addPlayer: (tournamentId: number, playerId: number): Promise<any> =>
    apiClient.post(`/api/Tournaments/${tournamentId}/Players/${playerId}`, {}),

  // Remove player from tournament (TournamentOrganizer/Admin) - Fixed: Both IDs are numbers
  removePlayer: (tournamentId: number, playerId: number): Promise<void> =>
    apiClient.delete(`/api/Tournaments/${tournamentId}/Players/${playerId}`),

  // Unregister player from tournament - Fixed: Both IDs are numbers
  unregisterPlayer: (tournamentId: number, playerId: number): Promise<void> =>
    apiClient.delete(`/api/Tournaments/${tournamentId}/register/${playerId}`),

  // Get tournament categories - Fixed: Tournament ID is number
  getCategories: (id: number, pagination?: PaginationRequest): Promise<PaginationResponse<any>> =>
    apiClient.get(`/api/Tournaments/${id}/Categories?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Add category to tournament (TournamentOrganizer/Admin) - Fixed: Both IDs are numbers
  addCategory: (tournamentId: number, categoryId: number): Promise<any> =>
    apiClient.post(`/api/Tournaments/${tournamentId}/Categories/${categoryId}`, {}),

  // Remove category from tournament (TournamentOrganizer/Admin) - Fixed: Both IDs are numbers
  removeCategory: (tournamentId: number, categoryId: number): Promise<void> =>
    apiClient.delete(`/api/Tournaments/${tournamentId}/Categories/${categoryId}`),

  // Create rounds for tournament (TournamentOrganizer/Admin) - Fixed: Tournament ID is number
  createRounds: (id: number): Promise<string> =>
    apiClient.post(`/api/tournaments/${id}/rounds`, {}),

  // Generate tee times (TournamentOrganizer/Admin) - Fixed: Tournament ID is number
  generateTeeTimes: (id: number): Promise<any> =>
    apiClient.post(`/api/tournaments/${id}/generate-teetimes`, {}),

  // Get tee times (Player) - Fixed: Tournament ID is number
  getTeeTimes: (id: number): Promise<any> =>
    apiClient.get(`/api/tournaments/${id}/teetimes`),

  // Update tee time for player (TournamentOrganizer/Admin)
  updateTeeTime: (roundId: number, playerId: number, teeTime: string, startingHole: number): Promise<any> =>
    apiClient.put(`/api/rounds/${roundId}/players/${playerId}`, { 
      teeTime, 
      startingHole 
    }),

  // Get tournament scorecards - Fixed: Tournament ID is number
  getScorecards: (id: number): Promise<any> =>
    apiClient.get(`/api/Tournaments/${id}/Scorecards`),

  // Get active tournaments
  getActive: (): Promise<TournamentListGetDTO[]> =>
    apiClient.get('/api/Tournaments/Active'),

  // Get completed tournaments
  getCompleted: (): Promise<TournamentListGetDTO[]> =>
    apiClient.get('/api/Tournaments/Completed'),

  // Calculate tournament results (TournamentOrganizer/Admin) - Fixed: Tournament ID is number
  calculateResults: (id: number): Promise<TournamentRankingDTO[]> =>
    apiClient.post(`/api/Tournaments/${id}/CalculateResults`, {}),
};
