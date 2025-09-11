import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '@/lib/services/tournamentService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';
import type { TeeTime, TeeTimeGeneration, TeeTimeAssignment } from '@/types/teeTime';

// Query Keys
export const teeTimeKeys = {
  all: ['teeTimes'] as const,
  tournament: (tournamentId: string) => [...teeTimeKeys.all, 'tournament', tournamentId] as const,
  round: (tournamentId: string, roundNumber: number) => [...teeTimeKeys.tournament(tournamentId), 'round', roundNumber] as const,
};

// Get tee times for a tournament
export const useTeeTimes = (tournamentId: string) => {
  return useQuery({
    queryKey: teeTimeKeys.tournament(tournamentId),
    queryFn: () => tournamentService.getTeeTimes(tournamentId),
    enabled: !!tournamentId,
  });
};

// Generate tee times mutation
export const useGenerateTeeTimes = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useGenerateTeeTimes' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: (tournamentId: string) => tournamentService.generateTeeTimes(tournamentId),
    onSuccess: (_, tournamentId) => {
      // Invalidate tee times for this tournament
      queryClient.invalidateQueries({ queryKey: teeTimeKeys.tournament(tournamentId) });
      
      toast({
        title: "Tee Times Generated",
        description: "Tee times have been successfully generated for the tournament.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to generate tee times');
      toast({
        title: "Generation Failed",
        description: "Failed to generate tee times. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Assign player to tee time mutation
export const useAssignPlayerToTeeTime = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useAssignPlayerToTeeTime' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ teeTimeId, playerId, position }: TeeTimeAssignment) => {
      // This would need to be implemented in the tournament service
      // For now, we'll use a placeholder
      return Promise.resolve();
    },
    onMutate: async ({ teeTimeId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: teeTimeKeys.all });
      
      // Snapshot the previous value
      const previousTeeTimes = queryClient.getQueryData(teeTimeKeys.all);
      
      return { previousTeeTimes };
    },
    onSuccess: (_, { teeTimeId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: teeTimeKeys.all });
      
      toast({
        title: "Player Assigned",
        description: "Player has been successfully assigned to the tee time.",
      });
    },
    onError: (error, _, context) => {
      // Rollback optimistic update
      if (context?.previousTeeTimes) {
        queryClient.setQueryData(teeTimeKeys.all, context.previousTeeTimes);
      }
      
      handleError(error, 'Failed to assign player to tee time');
      toast({
        title: "Assignment Failed",
        description: "Failed to assign player to tee time. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Remove player from tee time mutation
export const useRemovePlayerFromTeeTime = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useRemovePlayerFromTeeTime' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ teeTimeId, playerId }: { teeTimeId: string; playerId: string }) => {
      // This would need to be implemented in the tournament service
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teeTimeKeys.all });
      
      toast({
        title: "Player Removed",
        description: "Player has been removed from the tee time.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to remove player from tee time');
      toast({
        title: "Removal Failed",
        description: "Failed to remove player from tee time. Please try again.",
        variant: "destructive",
      });
    },
  });
};
