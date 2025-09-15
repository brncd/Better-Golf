import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scoringService } from '@/lib/services/scoringService';
import { useErrorHandler } from './useErrorHandler';
import type { 
  ScorecardListGetDTO, 
  SingleScorecardDTO, 
  ScorecardPostDTO,
  PaginationRequest,
  PaginationResponse 
} from '@/types';

// Hook to get tournament scorecards
export function useTournamentScorecards(tournamentId: number, pagination?: PaginationRequest) {
  return useQuery<PaginationResponse<ScorecardListGetDTO>>({
    queryKey: ['tournament-scorecards', tournamentId, pagination],
    queryFn: () => scoringService.getTournamentScorecards(tournamentId, pagination),
    enabled: !!tournamentId,
  });
}

// Hook to get single scorecard with details
export function useScorecard(scorecardId: number) {
  return useQuery<SingleScorecardDTO>({
    queryKey: ['scorecard', scorecardId],
    queryFn: () => scoringService.getScorecard(scorecardId),
    enabled: !!scorecardId,
  });
}

// Hook to create scorecard
export function useCreateScorecard() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'Scorecard Creation' });

  return useMutation<SingleScorecardDTO, Error, ScorecardPostDTO>({
    mutationFn: (scorecard: ScorecardPostDTO) => scoringService.createScorecard(scorecard),
    onSuccess: (data, variables) => {
      // Invalidate tournament scorecards query
      queryClient.invalidateQueries({ 
        queryKey: ['tournament-scorecards', variables.tournamentId] 
      });
      // Cache the new scorecard
      queryClient.setQueryData(['scorecard', data.id], data);
    },
    onError: (error) => handleError(error),
  });
}

// Hook to update scorecard
export function useUpdateScorecard() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'Scorecard Update' });

  return useMutation<void, Error, { scorecardId: number; scorecard: ScorecardPostDTO }>({
    mutationFn: ({ scorecardId, scorecard }) => 
      scoringService.updateScorecard(scorecardId, scorecard),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['scorecard', variables.scorecardId] });
      queryClient.invalidateQueries({ 
        queryKey: ['tournament-scorecards', variables.scorecard.tournamentId] 
      });
    },
    onError: (error) => handleError(error),
  });
}

// Hook to update individual hole score
export function useUpdateHoleScore() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'Score Update' });

  return useMutation<void, Error, { 
    scorecardId: number; 
    holeId: number; 
    strokes: number; 
    roundNumber?: number;
  }>({
    mutationFn: ({ scorecardId, holeId, strokes, roundNumber }) => 
      scoringService.updateHoleScore(scorecardId, holeId, strokes, roundNumber),
    onSuccess: (_, variables) => {
      // Invalidate scorecard to refresh totals
      queryClient.invalidateQueries({ queryKey: ['scorecard', variables.scorecardId] });
    },
    onError: (error) => handleError(error),
  });
}

// Hook to lock scorecard
export function useLockScorecard() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'Scorecard Lock' });

  return useMutation<void, Error, number>({
    mutationFn: (scorecardId: number) => scoringService.lockScorecard(scorecardId),
    onSuccess: (_, scorecardId) => {
      // Invalidate scorecard to refresh lock status
      queryClient.invalidateQueries({ queryKey: ['scorecard', scorecardId] });
    },
    onError: (error) => handleError(error),
  });
}

// Hook to delete scorecard
export function useDeleteScorecard() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'Scorecard Deletion' });

  return useMutation<void, Error, number>({
    mutationFn: (scorecardId: number) => scoringService.deleteScorecard(scorecardId),
    onSuccess: (_, scorecardId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: ['scorecard', scorecardId] });
      queryClient.invalidateQueries({ queryKey: ['tournament-scorecards'] });
    },
    onError: (error) => handleError(error),
  });
}

// Hook to get hole score
export function useHoleScore(scorecardId: number, holeId: number) {
  return useQuery<{ strokes: number }>({
    queryKey: ['hole-score', scorecardId, holeId],
    queryFn: () => scoringService.getHoleScore(scorecardId, holeId),
    enabled: !!scorecardId && !!holeId,
  });
}
