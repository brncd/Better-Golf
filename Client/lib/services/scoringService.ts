import { apiClient } from '../apiService';
import type { 
  TournamentListGetDTO, 
  ScorecardDTO, 
  ScorecardListGetDTO,
  SingleScorecardDTO,
  ScorecardPostDTO,
  ScorecardResultPostDTO,
  PaginationRequest,
  PaginationResponse
} from '@/types';

export const scoringService = {
  // Get active tournaments for scoring
  getActiveTournaments: (): Promise<TournamentListGetDTO[]> =>
    apiClient.get('/api/Tournaments/Active'),

  // Get tournament scorecards with pagination
  getTournamentScorecards: (tournamentId: number, pagination?: PaginationRequest): Promise<PaginationResponse<ScorecardListGetDTO>> =>
    apiClient.get(`/api/Scorecards/Tournament/${tournamentId}?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 50}`),

  // Get scorecard by ID with full details
  getScorecard: (scorecardId: number): Promise<SingleScorecardDTO> =>
    apiClient.get(`/api/Scorecards/${scorecardId}`),

  // Create new scorecard
  createScorecard: (scorecard: ScorecardPostDTO): Promise<SingleScorecardDTO> =>
    apiClient.post('/api/Scorecards', scorecard),

  // Update scorecard
  updateScorecard: (scorecardId: number, scorecard: ScorecardPostDTO): Promise<void> =>
    apiClient.put(`/api/Scorecards/${scorecardId}`, scorecard),

  // Lock scorecard (prevent further edits)
  lockScorecard: (scorecardId: number): Promise<void> =>
    apiClient.put(`/api/Scorecards/${scorecardId}/lock`, {}),

  // Delete scorecard
  deleteScorecard: (scorecardId: number): Promise<void> =>
    apiClient.delete(`/api/Scorecards/${scorecardId}`),

  // Update individual hole score
  updateHoleScore: (scorecardId: number, holeId: number, strokes: number, roundNumber: number = 1): Promise<void> =>
    apiClient.put(`/api/ScorecardResults/${scorecardId}/${holeId}`, { 
      strokes, 
      holeId, 
      roundNumber 
    }),

  // Get scorecard result for specific hole
  getHoleScore: (scorecardId: number, holeId: number): Promise<{ strokes: number }> =>
    apiClient.get(`/api/ScorecardResults/${scorecardId}/${holeId}`),

  // Legacy method for backward compatibility
  getTournamentScorecardsLegacy: (tournamentId: string): Promise<ScorecardDTO[]> =>
    apiClient.get(`/api/Tournaments/${tournamentId}/Scorecards`),
};
