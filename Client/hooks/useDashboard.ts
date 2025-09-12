import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/services/dashboardService';

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
};

// Dashboard Stats Query
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
    // Refetch every 5 minutes to keep stats current
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    retry: 2,
  });
};

// Recent Activity Query
export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: [...dashboardKeys.activity(), limit],
    queryFn: () => dashboardService.getRecentActivity(limit),
    // Refetch every 2 minutes for recent activity
    refetchInterval: 2 * 60 * 1000,
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute
    retry: 2,
  });
};

// Tournament Activity Query
export const useTournamentActivity = (tournamentId: number) => {
  return useQuery({
    queryKey: [...dashboardKeys.activity(), 'tournament', tournamentId],
    queryFn: () => dashboardService.getTournamentActivity(tournamentId),
    enabled: !!tournamentId,
    refetchInterval: 2 * 60 * 1000,
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });
};
