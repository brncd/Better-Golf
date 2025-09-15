import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '@/lib/services/tournamentService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';

// Tournament lifecycle management hooks
export const useTournamentStatusChange = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useTournamentStatusChange' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ tournamentId, status }: { tournamentId: number; status: string }) =>
      tournamentService.setStatus(tournamentId, status),
    onSuccess: (_, { tournamentId, status }) => {
      // Invalidate tournament queries
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      
      const statusMessages = {
        'OpenRegistration': 'Tournament registration is now open',
        'InProgress': 'Tournament has been started',
        'Completed': 'Tournament has been completed',
        'Archived': 'Tournament has been archived'
      };
      
      toast({
        title: "Status Updated",
        description: statusMessages[status as keyof typeof statusMessages] || `Tournament status changed to ${status}`,
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to update tournament status');
      toast({
        title: "Update Failed",
        description: "Failed to update tournament status. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useGenerateScorecards = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useGenerateScorecards' });
  const { toast } = useToast();

  return useMutation({
    mutationFn: (tournamentId: number) =>
      tournamentService.generateScorecards(tournamentId),
    onSuccess: (_, tournamentId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId, 'scorecards'] });
      
      toast({
        title: "Scorecards Generated",
        description: "Scorecards have been created for all registered players.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to generate scorecards');
      toast({
        title: "Generation Failed",
        description: "Failed to generate scorecards. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Combined hook for starting tournament (status change + scorecard generation)
export const useStartTournament = () => {
  const statusMutation = useTournamentStatusChange();
  const scorecardMutation = useGenerateScorecards();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tournamentId: number) => {
      // First, change status to InProgress
      await statusMutation.mutateAsync({ tournamentId, status: 'InProgress' });
      
      // Then, generate scorecards for all players
      await scorecardMutation.mutateAsync(tournamentId);
      
      return tournamentId;
    },
    onSuccess: () => {
      toast({
        title: "Tournament Started",
        description: "Tournament has been started and scorecards generated for all players.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start Tournament",
        description: "An error occurred while starting the tournament. Please try again.",
        variant: "destructive",
      });
    },
  });
};
