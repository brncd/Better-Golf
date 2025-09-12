"use client"

import { useQuery } from '@tanstack/react-query'
import { playerService } from '@/lib/services'
import type { PlayerTournamentHistoryListDTO } from '@/types'

export function usePlayerHistory(playerId: number) {
  return useQuery<PlayerTournamentHistoryListDTO>({
    queryKey: ['player-history', playerId],
    queryFn: () => playerService.getTournamentHistory(playerId),
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}
