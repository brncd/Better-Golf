import { apiClient } from '../apiService';
import { TeeTimeDTO, TeeTimeUpdateDTO } from '@/types';

export const teeTimeService = {
  // Generate tee times for a tournament
  generateTeeTimes: (tournamentId: number): Promise<TeeTimeDTO[]> =>
    apiClient.post(`/api/tournaments/${tournamentId}/generate-teetimes`, {}),

  // Get all tee times for a tournament
  getTeeTimes: (tournamentId: number): Promise<TeeTimeDTO[]> =>
    apiClient.get(`/api/tournaments/${tournamentId}/teetimes`),

  // Update a specific player's tee time
  updateTeeTime: (
    roundId: number, 
    playerId: number, 
    update: TeeTimeUpdateDTO
  ): Promise<TeeTimeDTO> =>
    apiClient.put(`/api/rounds/${roundId}/players/${playerId}`, update),

  // Assign player to tee time
  assignPlayerToTeeTime: (teeTimeId: number, playerId: number): Promise<TeeTimeDTO> =>
    apiClient.post(`/api/teetimes/${teeTimeId}/players/${playerId}`, {}),

  // Remove player from tee time
  removePlayerFromTeeTime: (teeTimeId: number, playerId: number): Promise<void> =>
    apiClient.delete(`/api/teetimes/${teeTimeId}/players/${playerId}`),
};
