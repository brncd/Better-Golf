import { apiClient } from '../apiService';
import type { RoundInfo } from '@/types';

// The backend RoundInfo model might be different from the DTO.
// This DTO is based on the fields available in the TournamentForm.
interface RoundInfoPostDTO {
  interval: number;
  firstRoundTime: number;
  isShotgun: boolean;
}

export const roundInfoService = {
  create: (data: RoundInfoPostDTO): Promise<RoundInfo> =>
    apiClient.post('/api/RoundsInfo', data),
};
