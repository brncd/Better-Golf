import { serverApiClient } from './serverApiClient';
import type { 
  TournamentListGetDTO, 
  PaginationResponse 
} from '@/types';
import type { DashboardStats, RecentActivity } from '@/lib/services/dashboardService';

// Server-side tournament service
export const serverTournamentService = {
  getActive: (): Promise<TournamentListGetDTO[]> =>
    serverApiClient.get('/api/Tournaments/Active'),

  getCompleted: (): Promise<TournamentListGetDTO[]> =>
    serverApiClient.get('/api/Tournaments/Completed'),

  getAll: (pageNumber = 1, pageSize = 100): Promise<PaginationResponse<TournamentListGetDTO>> =>
    serverApiClient.get(`/api/Tournaments?pageNumber=${pageNumber}&pageSize=${pageSize}`),
};

// Server-side dashboard service
export const serverDashboardService = {
  getStats: (): Promise<DashboardStats> =>
    serverApiClient.get('/api/Dashboard/Stats'),

  getRecentActivity: (): Promise<RecentActivity[]> =>
    serverApiClient.get('/api/Dashboard/RecentActivity'),
};
