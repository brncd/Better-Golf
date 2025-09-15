import { apiClient } from '../apiService';
import { ScorecardListGetDTO, SingleScorecardDTO, ScorecardPostDTO } from '@/types';
import { PaginationRequest, PaginationResponse } from '@/types';

export const scorecardService = {
  // Get all scorecards for a tournament with pagination
  getTournamentScorecards: (
    tournamentId: number, 
    pagination: PaginationRequest = { pageNumber: 1, pageSize: 10 }
  ): Promise<PaginationResponse<ScorecardListGetDTO>> =>
    apiClient.get(`/api/Scorecards/Tournament/${tournamentId}?page=${pagination.pageNumber}&pageSize=${pagination.pageSize}`),

  // Get a specific scorecard by ID
  getScorecardById: (id: number): Promise<SingleScorecardDTO> =>
    apiClient.get(`/api/Scorecards/${id}`),

  // Create a new scorecard
  createScorecard: (scorecard: ScorecardPostDTO): Promise<SingleScorecardDTO> =>
    apiClient.post('/api/Scorecards', scorecard),

  // Update an existing scorecard
  updateScorecard: (id: number, scorecard: ScorecardPostDTO): Promise<void> =>
    apiClient.put(`/api/Scorecards/${id}`, scorecard),

  // Lock a scorecard (prevent further edits)
  lockScorecard: (id: number): Promise<void> =>
    apiClient.put(`/api/Scorecards/${id}/lock`, {}),

  // Delete a scorecard
  deleteScorecard: (id: number): Promise<void> =>
    apiClient.delete(`/api/Scorecards/${id}`),
};
