import { apiClient } from '../apiService';

export interface DashboardStats {
  totalTournaments: number;
  activeTournaments: number;
  upcomingTournaments: number;
  completedTournaments: number;
  totalPlayers: number;
  activePlayers: number;
  totalCourses: number;
  totalCategories: number;
  monthlyTournamentGrowth: number;
  monthlyPlayerGrowth: number;
  playerParticipationRate: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  entityType: 'tournament' | 'player' | 'course' | 'score';
  entityId?: number;
}

export const dashboardService = {
  // Get comprehensive dashboard statistics
  getStats: (): Promise<DashboardStats> =>
    apiClient.get('/api/dashboard/stats'),

  // Get recent system activity
  getRecentActivity: (limit: number = 10): Promise<RecentActivity[]> =>
    apiClient.get(`/api/dashboard/activity?limit=${limit}`),

  // Get dashboard overview (combines stats and activity)
  getOverview: (): Promise<{
    stats: DashboardStats;
    recentActivity: RecentActivity[];
  }> =>
    apiClient.get('/api/dashboard/overview'),
};
