import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scorecardService } from '@/lib/services/scorecardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';
import type { ScorecardPostDTO, PaginationRequest } from '@/types';

// Query Keys
export const scorecardKeys = {
  all: ['scorecards'] as const,
  tournament: (tournamentId: number) => [...scorecardKeys.all, 'tournament', tournamentId] as const,
  scorecard: (id: number) => [...scorecardKeys.all, 'scorecard', id] as const,
};

// Get tournament scorecards with pagination
export const useTournamentScorecards = (
  tournamentId: number, 
  pagination: PaginationRequest = { pageNumber: 1, pageSize: 10 }
) => {
  return useQuery({
    queryKey: [...scorecardKeys.tournament(tournamentId), pagination],
    queryFn: () => scorecardService.getTournamentScorecards(tournamentId, pagination),
    enabled: !!tournamentId,
  });
};

// Get single scorecard by ID
export const useScorecard = (id: number) => {
  return useQuery({
    queryKey: scorecardKeys.scorecard(id),
    queryFn: () => scorecardService.getScorecardById(id),
    enabled: !!id,
  });
};

// Create scorecard mutation
export const useCreateScorecard = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useCreateScorecard' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: (scorecard: ScorecardPostDTO) => scorecardService.createScorecard(scorecard),
    onSuccess: (data, variables) => {
      // Invalidate tournament scorecards
      queryClient.invalidateQueries({ 
        queryKey: scorecardKeys.tournament(variables.tournamentId) 
      });
      
      toast({
        title: "Scorecard Created",
        description: "Scorecard has been successfully created.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to create scorecard');
      toast({
        title: "Creation Failed",
        description: "Failed to create scorecard. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update scorecard mutation
export const useUpdateScorecard = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useUpdateScorecard' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, scorecard }: { id: number; scorecard: ScorecardPostDTO }) => 
      scorecardService.updateScorecard(id, scorecard),
    onSuccess: (_, { id, scorecard }) => {
      // Invalidate specific scorecard and tournament scorecards
      queryClient.invalidateQueries({ queryKey: scorecardKeys.scorecard(id) });
      queryClient.invalidateQueries({ 
        queryKey: scorecardKeys.tournament(scorecard.tournamentId) 
      });
      
      toast({
        title: "Scorecard Updated",
        description: "Scorecard has been successfully updated.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to update scorecard');
      toast({
        title: "Update Failed",
        description: "Failed to update scorecard. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Lock scorecard mutation
export const useLockScorecard = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useLockScorecard' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => scorecardService.lockScorecard(id),
    onSuccess: (_, id) => {
      // Invalidate specific scorecard
      queryClient.invalidateQueries({ queryKey: scorecardKeys.scorecard(id) });
      
      toast({
        title: "Scorecard Locked",
        description: "Scorecard has been locked and cannot be edited further.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to lock scorecard');
      toast({
        title: "Lock Failed",
        description: "Failed to lock scorecard. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Delete scorecard mutation
export const useDeleteScorecard = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useDeleteScorecard' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => scorecardService.deleteScorecard(id),
    onSuccess: (_, id) => {
      // Invalidate all scorecard queries
      queryClient.invalidateQueries({ queryKey: scorecardKeys.all });
      
      toast({
        title: "Scorecard Deleted",
        description: "Scorecard has been successfully deleted.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to delete scorecard');
      toast({
        title: "Delete Failed",
        description: "Failed to delete scorecard. Please try again.",
        variant: "destructive",
      });
    },
  });
};
