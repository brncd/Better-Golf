import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teeTimeService } from '@/lib/services/teeTimeService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';
import type { TeeTimeDTO, TeeTimeUpdateDTO } from '@/types';

// Query Keys
export const teeTimeKeys = {
  all: ['teeTimes'] as const,
  tournament: (tournamentId: string) => [...teeTimeKeys.all, 'tournament', tournamentId] as const,
  round: (tournamentId: string, roundNumber: number) => [...teeTimeKeys.tournament(tournamentId), 'round', roundNumber] as const,
};

// Get tee times for a tournament
export const useTeeTimes = (tournamentId: number) => {
  return useQuery<TeeTimeDTO[], Error>({
    queryKey: teeTimeKeys.tournament(tournamentId.toString()),
    queryFn: () => teeTimeService.getTeeTimes(tournamentId),
    enabled: !!tournamentId,
  });
};

// Generate tee times mutation
export const useGenerateTeeTimes = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useGenerateTeeTimes' });
  const { toast } = useToast();

  return useMutation<TeeTimeDTO[], Error, number>({
    mutationFn: (tournamentId: number) => teeTimeService.generateTeeTimes(tournamentId),
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: teeTimeKeys.tournament(tournamentId.toString()) });
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

// Update player tee time mutation
export const useUpdateTeeTime = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useUpdateTeeTime' });
  const { toast } = useToast();

  return useMutation<TeeTimeDTO, Error, { tournamentId: number; roundId: number; playerId: number; update: TeeTimeUpdateDTO }>({
    mutationFn: ({ roundId, playerId, update }) => 
      teeTimeService.updateTeeTime(roundId, playerId, update),
    onSuccess: (_, { tournamentId }) => {
      queryClient.invalidateQueries({ queryKey: teeTimeKeys.tournament(tournamentId.toString()) });
      toast({ title: "Success", description: "Tee time updated successfully." });
    },
    onError: (error) => {
      handleError(error, 'Failed to update tee time');
      toast({
        title: "Update Failed",
        description: "Could not update the tee time. Please try again.",
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

  return useMutation<TeeTimeDTO, Error, { teeTimeId: number; playerId: number }>({ 
    mutationFn: ({ teeTimeId, playerId }) =>
      teeTimeService.assignPlayerToTeeTime(teeTimeId, playerId),
    onSuccess: (data, { teeTimeId }) => {
      queryClient.invalidateQueries({ queryKey: teeTimeKeys.all });
      toast({
        title: "Player Assigned",
        description: "Player has been assigned to the tee time.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to assign player to tee time');
      toast({
        title: "Assignment Failed",
        description: "Failed to assign player. Please try again.",
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

  return useMutation<void, Error, { teeTimeId: number; playerId: number }>({ 
    mutationFn: ({ teeTimeId, playerId }) =>
      teeTimeService.removePlayerFromTeeTime(teeTimeId, playerId),
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
        description: "Failed to remove player. Please try again.",
        variant: "destructive",
      });
    },
  });
};