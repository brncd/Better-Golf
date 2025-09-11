import { TournamentListGetDTO, ScorecardDTO, ScorecardResultDTO } from '@/types';
import { apiClient } from '../apiService';

export interface ScorecardWithResults extends ScorecardDTO {
  results: ScorecardResultDTO[];
}

export const scoringService = {
  // Get active tournaments for scoring
  async getActiveTournaments(): Promise<TournamentListGetDTO[]> {
    const response = await apiClient.get('/api/Tournaments/Active') as any;
    return response.data;
  },

  // Get tournament scorecards for scoring
  async getTournamentScorecards(tournamentId: string): Promise<ScorecardDTO[]> {
    const response = await apiClient.get(`/api/Tournaments/${tournamentId}/Scorecards`) as any;
    return response.data;
  },

  // Get specific scorecard with results
  async getScorecardWithResults(scorecardId: string): Promise<ScorecardWithResults> {
    const response = await apiClient.get(`/api/Scorecards/${scorecardId}`) as any;
    return response.data;
  },

  // Update scorecard result for a specific hole
  async updateScorecardResult(
    scorecardId: string, 
    holeId: string, 
    strokes: number,
    roundNumber: number = 1
  ): Promise<void> {
    await apiClient.put(`/api/ScorecardResults/${scorecardId}/${holeId}`, {
      strokes,
      roundNumber
    });
  },

  // Get scorecard result for specific hole
  async getScorecardResult(scorecardId: string, holeId: string): Promise<ScorecardResultDTO | null> {
    try {
      const response = await apiClient.get(`/api/ScorecardResults/${scorecardId}/${holeId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Lock scorecard (prevent further edits)
  async lockScorecard(scorecardId: string): Promise<void> {
    await apiClient.put(`/api/Scorecards/${scorecardId}/lock`);
  },

  // Get tournament rankings/leaderboard
  async getTournamentRankings(tournamentId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/Tournaments/${tournamentId}/rankings`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }
};
