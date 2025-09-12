import { apiClient } from '../apiService';

export interface DashboardStats {
  totalTournaments: number;
  activeTournaments: number;
  upcomingTournaments: number;
  completedTournaments: number;
  totalPlayers: number;
  totalCourses: number;
  averagePlayersPerTournament: number;
  totalRoundsPlayed: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  playerName?: string;
  tournamentName?: string;
  relatedId?: number;
}

export const dashboardService = {
  // Get comprehensive dashboard statistics
  getStats: (): Promise<DashboardStats> =>
    apiClient.get('/api/dashboard/stats'),

  // Get recent system activity
  getRecentActivity: (limit: number = 10): Promise<RecentActivity[]> =>
    apiClient.get(`/api/dashboard/activity?limit=${limit}`),

  // Get tournament specific activity
  getTournamentActivity: (tournamentId: number): Promise<RecentActivity[]> =>
    apiClient.get(`/api/dashboard/tournament/${tournamentId}/activity`),
};
