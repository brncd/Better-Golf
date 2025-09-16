import { serverTournamentService } from './serverServices';
import type { TournamentListGetDTO, PaginationResponse } from '@/types';

// Server-side data fetching for tournaments
export async function getTournamentsData(pageNumber = 1, pageSize = 20): Promise<PaginationResponse<TournamentListGetDTO>> {
  try {
    return await serverTournamentService.getAll(pageNumber, pageSize);
  } catch (error) {
    console.error('Failed to fetch tournaments data:', error);
    
    // Return fallback data structure
    return {
      items: [],
      pageNumber: 1,
      pageSize: pageSize,
      totalPages: 0,
      totalCount: 0,
    };
  }
}
