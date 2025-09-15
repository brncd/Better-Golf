import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '@/lib/services';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from './use-toast';
import type { 
  SingleTournamentDTO, 
  TournamentPostDTO, 
  TournamentListGetDTO,
  TournamentRankingDTO,
  PaginationRequest,
  PaginationResponse 
} from '@/types';

// Query Keys
export const tournamentKeys = {
  all: ['tournaments'] as const,
  lists: () => [...tournamentKeys.all, 'list'] as const,
  list: (filters: PaginationRequest) => [...tournamentKeys.lists(), filters] as const,
  details: () => [...tournamentKeys.all, 'detail'] as const,
  detail: (id: string) => [...tournamentKeys.details(), id] as const,
  rankings: (id: string) => [...tournamentKeys.detail(id), 'rankings'] as const,
  players: (id: string) => [...tournamentKeys.detail(id), 'players'] as const,
  rounds: (id: string) => [...tournamentKeys.detail(id), 'rounds'] as const,
};

// Tournaments List Query
export const useTournaments = (params?: PaginationRequest) => {
  return useQuery({
    queryKey: tournamentKeys.list(params || {}),
    queryFn: () => tournamentService.getAll(params),
  });
};

// Single Tournament Query
export const useTournament = (id: number) => {
  return useQuery({
    queryKey: tournamentKeys.detail(id.toString()),
    queryFn: () => tournamentService.getById(id),
    enabled: !!id,
  });
};

// Tournament Rankings Query
export const useTournamentRankings = (id: number) => {
  return useQuery({
    queryKey: tournamentKeys.rankings(id.toString()),
    queryFn: () => tournamentService.getRankings(id),
    enabled: !!id,
  });
};

// Calculate Results Mutation
export const useCalculateResults = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (tournamentId: number) => tournamentService.calculateResults(tournamentId),
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.rankings(tournamentId.toString()) });
      toast({
        title: "Success",
        description: "Tournament results have been calculated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to calculate tournament results.",
        variant: "destructive",
      });
    },
  });
};

// Tournament Players Query
export const useTournamentPlayers = (id: number) => {
  return useQuery({
    queryKey: tournamentKeys.players(id.toString()),
    queryFn: () => tournamentService.getPlayers(id),
    enabled: !!id,
  });
};

// Tournament Rounds Query
export const useTournamentRounds = (id: number) => {
  return useQuery({
    queryKey: tournamentKeys.rounds(id.toString()),
    queryFn: () => tournamentService.getRounds(id),
    enabled: !!id,
  });
};

// Create Tournament Mutation
export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useCreateTournament' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: TournamentPostDTO) => tournamentService.create(data),
    onSuccess: (newTournament) => {
      // Invalidate and refetch tournaments list
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
      
      toast({
        title: "Tournament Created",
        description: `${newTournament.name} has been created successfully.`,
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to create tournament');
      toast({
        title: "Error",
        description: "Failed to create tournament. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update Tournament Mutation
export const useUpdateTournament = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useUpdateTournament' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TournamentPostDTO }) => 
      tournamentService.update(id, data),
    onSuccess: (updatedTournament, { id }) => {
      // Update the specific tournament in cache
      queryClient.setQueryData(
        tournamentKeys.detail(id.toString()),
        updatedTournament
      );
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
      
      toast({
        title: "Tournament Updated",
        description: "Tournament has been updated successfully.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to update tournament');
      toast({
        title: "Error",
        description: "Failed to update tournament. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Delete Tournament Mutation
export const useDeleteTournament = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useDeleteTournament' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: number) => tournamentService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: tournamentKeys.detail(id.toString()) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
      
      toast({
        title: "Tournament Deleted",
        description: "Tournament has been deleted successfully.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to delete tournament');
      toast({
        title: "Error",
        description: "Failed to delete tournament. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Register for Tournament Mutation
export const useRegisterForTournament = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useRegisterForTournament' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (tournamentId: number) => tournamentService.register(tournamentId),
    onMutate: async (tournamentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: tournamentKeys.players(tournamentId.toString()) });
      
      // Snapshot the previous value
      const previousPlayers = queryClient.getQueryData(tournamentKeys.players(tournamentId.toString()));
      
      // Optimistically update to show user as registered
      // Note: This is a simplified optimistic update - in a real scenario we'd add the current user to the players list
      
      return { previousPlayers };
    },
    onSuccess: (_, tournamentId) => {
      // Invalidate tournament details and players to get fresh data
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId.toString()) });
      queryClient.invalidateQueries({ queryKey: tournamentKeys.players(tournamentId.toString()) });
      
      toast({
        title: "Registration Successful",
        description: "You have been registered for the tournament.",
      });
    },
    onError: (error, tournamentId, context) => {
      // Rollback optimistic update
      if (context?.previousPlayers) {
        queryClient.setQueryData(tournamentKeys.players(tournamentId.toString()), context.previousPlayers);
      }
      
      handleError(error, 'Failed to register for tournament');
      toast({
        title: "Registration Failed",
        description: "Failed to register for tournament. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: (_, __, tournamentId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: tournamentKeys.players(tournamentId.toString()) });
    },
  });
};

// Unregister from Tournament Mutation
export const useUnregisterFromTournament = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useUnregisterFromTournament' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ tournamentId, playerId }: { tournamentId: number; playerId: number }) => 
      tournamentService.unregisterPlayer(tournamentId, playerId),
    onSuccess: (_, { tournamentId }) => {
      // Invalidate tournament details and players
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId.toString()) });
      queryClient.invalidateQueries({ queryKey: tournamentKeys.players(tournamentId.toString()) });
      
      toast({
        title: "Unregistration Successful",
        description: "You have been unregistered from the tournament.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to unregister from tournament');
      toast({
        title: "Unregistration Failed",
        description: "Failed to unregister from tournament. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Add Player to Tournament Mutation (for organizers)
export const useAddPlayerToTournament = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useAddPlayerToTournament' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ tournamentId, playerId }: { tournamentId: number; playerId: number }) => 
      tournamentService.addPlayer(tournamentId, playerId),
    onSuccess: (_, { tournamentId }) => {
      // Invalidate tournament details and players
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId.toString()) });
      queryClient.invalidateQueries({ queryKey: tournamentKeys.players(tournamentId.toString()) });
      
      toast({
        title: "Player Added",
        description: "Player has been successfully added to the tournament.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to add player to tournament');
      toast({
        title: "Add Player Failed",
        description: "Failed to add player to tournament. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Remove Player from Tournament Mutation (for organizers)
export const useRemovePlayerFromTournament = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useRemovePlayerFromTournament' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ tournamentId, playerId }: { tournamentId: number; playerId: number }) => 
      tournamentService.removePlayer(tournamentId, playerId),
    onSuccess: (_, { tournamentId }) => {
      // Invalidate tournament details and players
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId.toString()) });
      queryClient.invalidateQueries({ queryKey: tournamentKeys.players(tournamentId.toString()) });
      
      toast({
        title: "Player Removed",
        description: "Player has been successfully removed from the tournament.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to remove player from tournament');
      toast({
        title: "Remove Player Failed",
        description: "Failed to remove player from tournament. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Set Tournament Status Mutation (for organizers/admins)
export const useSetTournamentStatus = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useSetTournamentStatus' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ tournamentId, status }: { tournamentId: number; status: string }) => 
      tournamentService.setStatus(tournamentId, status),
    onSuccess: (_, { tournamentId, status }) => {
      // Invalidate tournament details to get fresh data
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId.toString()) });
      
      // Also invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
      
      // If status changed to InProgress, also invalidate players to reflect scorecard generation
      if (status === 'InProgress') {
        queryClient.invalidateQueries({ queryKey: tournamentKeys.players(tournamentId.toString()) });
      }
      
      const statusMessages = {
        'OpenRegistration': 'Tournament registration is now open',
        'InProgress': 'Tournament has started and scorecards have been generated',
        'Completed': 'Tournament has been completed and scorecards are locked',
        'Archived': 'Tournament has been archived'
      };
      
      toast({
        title: "Tournament Status Updated",
        description: statusMessages[status as keyof typeof statusMessages] || `Tournament status changed to ${status}`,
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to update tournament status');
      toast({
        title: "Status Update Failed",
        description: "Failed to update tournament status. Please try again.",
        variant: "destructive",
      });
    },
  });
};
