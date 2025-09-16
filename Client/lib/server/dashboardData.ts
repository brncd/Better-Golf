import { serverTournamentService, serverDashboardService } from './serverServices';
import type { TournamentListGetDTO } from '@/types';
import type { DashboardStats, RecentActivity } from '@/lib/services/dashboardService';

// Server-side data fetching for dashboard
export async function getDashboardData() {
  try {
    // Fetch all dashboard data in parallel using specific endpoints
    const [stats, activity, activeTournaments, allTournaments] = await Promise.all([
      serverDashboardService.getStats(),
      serverDashboardService.getRecentActivity(),
      serverTournamentService.getActive(), // Use specific endpoint for active tournaments
      serverTournamentService.getAll(1, 100), // Get all tournaments to filter for upcoming
    ]);

    // Filter for upcoming tournaments (OpenRegistration status)
    const upcomingTournaments = allTournaments.items.filter((t: TournamentListGetDTO) => t.status === 'OpenRegistration');

    return {
      stats,
      activity,
      activeTournaments,
      upcomingTournaments,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    
    // Return fallback data structure
    return {
      stats: {
        activeTournaments: 0,
        totalPlayers: 0,
        totalCourses: 0,
        completedTournaments: 0,
      } as DashboardStats,
      activity: [] as RecentActivity[],
      activeTournaments: [] as TournamentListGetDTO[],
      upcomingTournaments: [] as TournamentListGetDTO[],
    };
  }
}

// Alternative approach: Get upcoming tournaments directly if backend supports it
export async function getUpcomingTournaments(): Promise<TournamentListGetDTO[]> {
  try {
    // If backend has a specific endpoint for upcoming tournaments, use it
    // Otherwise, we'll filter from all tournaments
    const allTournaments = await serverTournamentService.getAll(1, 100);
    return allTournaments.items.filter((t: TournamentListGetDTO) => t.status === 'OpenRegistration');
  } catch (error) {
    console.error('Failed to fetch upcoming tournaments:', error);
    return [];
  }
}
