import { apiClient } from '../apiService';
import type { 
  TournamentListGetDTO, 
  SingleTournamentDTO, 
  TournamentPostDTO, 
  TournamentRankingDTO,
  PaginationRequest, 
  PaginationResponse 
} from '@/types';

export const tournamentService = {
  // Get all tournaments with pagination
  getAll: (pagination?: PaginationRequest): Promise<PaginationResponse<TournamentListGetDTO>> =>
    apiClient.get(`/api/Tournaments?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Get tournament by ID
  getById: (id: string): Promise<SingleTournamentDTO> =>
    apiClient.get(`/api/Tournaments/${id}`),

  // Create new tournament (TournamentOrganizer/Admin)
  create: (tournament: TournamentPostDTO): Promise<SingleTournamentDTO> =>
    apiClient.post('/api/Tournaments', tournament),

  // Update tournament (TournamentOrganizer/Admin)
  update: (id: string, tournament: TournamentPostDTO): Promise<void> =>
    apiClient.put(`/api/Tournaments/${id}`, tournament),

  // Delete tournament (TournamentOrganizer/Admin)
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/Tournaments/${id}`),

  // Set tournament status (TournamentOrganizer/Admin)
  setStatus: (id: string, status: string): Promise<void> =>
    apiClient.put(`/api/Tournaments/${id}/status`, status),

  // Register current user to tournament (Player)
  register: (tournamentId: string): Promise<any> =>
    apiClient.post(`/api/tournaments/${tournamentId}/register`, {}),

  // Get tournament players
  getPlayers: (id: string, pagination?: PaginationRequest): Promise<PaginationResponse<any>> =>
    apiClient.get(`/api/Tournaments/${id}/Players?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Add player to tournament (TournamentOrganizer/Admin)
  addPlayer: (tournamentId: string, playerId: string): Promise<any> =>
    apiClient.post(`/api/Tournaments/${tournamentId}/Players/${playerId}`, {}),

  // Remove player from tournament (TournamentOrganizer/Admin)
  removePlayer: (tournamentId: string, playerId: string): Promise<void> =>
    apiClient.delete(`/api/Tournaments/${tournamentId}/Players/${playerId}`),

  // Get tournament categories
  getCategories: (id: string, pagination?: PaginationRequest): Promise<PaginationResponse<any>> =>
    apiClient.get(`/api/Tournaments/${id}/Categories?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Add category to tournament (TournamentOrganizer/Admin)
  addCategory: (tournamentId: string, categoryId: string): Promise<any> =>
    apiClient.post(`/api/Tournaments/${tournamentId}/Categories/${categoryId}`, {}),

  // Remove category from tournament (TournamentOrganizer/Admin)
  removeCategory: (tournamentId: string, categoryId: string): Promise<void> =>
    apiClient.delete(`/api/Tournaments/${tournamentId}/Categories/${categoryId}`),

  // Create rounds for tournament (TournamentOrganizer/Admin)
  createRounds: (id: string): Promise<string> =>
    apiClient.post(`/api/tournaments/${id}/rounds`, {}),

  // Generate tee times (TournamentOrganizer/Admin)
  generateTeeTimes: (id: string): Promise<any> =>
    apiClient.post(`/api/tournaments/${id}/generate-teetimes`, {}),

  // Get tee times (Player)
  getTeeTimes: (id: string): Promise<any> =>
    apiClient.get(`/api/tournaments/${id}/teetimes`),

  // Get tournament scorecards
  getScorecards: (id: string): Promise<any> =>
    apiClient.get(`/api/Tournaments/${id}/Scorecards`),

  // Get active tournaments
  getActive: (): Promise<TournamentListGetDTO[]> =>
    apiClient.get('/api/Tournaments/Active'),

  // Get completed tournaments
  getCompleted: (): Promise<TournamentListGetDTO[]> =>
    apiClient.get('/api/Tournaments/Completed'),

  // Calculate tournament results (TournamentOrganizer/Admin)
  calculateResults: (id: string): Promise<TournamentRankingDTO[]> =>
    apiClient.post(`/api/Tournaments/${id}/CalculateResults`, {}),
};
