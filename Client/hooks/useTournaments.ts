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
};

// Tournaments List Query
export const useTournaments = (params?: PaginationRequest) => {
  return useQuery({
    queryKey: tournamentKeys.list(params || {}),
    queryFn: () => tournamentService.getAll(params),
  });
};

// Single Tournament Query
export const useTournament = (id: string) => {
  const { handleError } = useErrorHandler({ context: 'useTournament' });
  
  return useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: () => tournamentService.getById(id),
    enabled: !!id,
    onError: (error) => handleError(error, `Failed to fetch tournament ${id}`),
  });
};

// Tournament Rankings Query
export const useTournamentRankings = (id: string) => {
  const { handleError } = useErrorHandler({ context: 'useTournamentRankings' });
  
  return useQuery({
    queryKey: tournamentKeys.rankings(id),
    queryFn: () => tournamentService.getRankings(id),
    enabled: !!id,
    onError: (error) => handleError(error, `Failed to fetch tournament rankings for ${id}`),
  });
};

// Tournament Players Query
export const useTournamentPlayers = (id: string) => {
  const { handleError } = useErrorHandler({ context: 'useTournamentPlayers' });
  
  return useQuery({
    queryKey: tournamentKeys.players(id),
    queryFn: () => tournamentService.getPlayers(id),
    enabled: !!id,
    onError: (error) => handleError(error, `Failed to fetch tournament players for ${id}`),
  });
};

// Create Tournament Mutation
export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useCreateTournament' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (tournament: TournamentPostDTO) => tournamentService.create(tournament),
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
    mutationFn: ({ id, tournament }: { id: string; tournament: Partial<TournamentPostDTO> }) =>
      tournamentService.update(id, tournament),
    onSuccess: (updatedTournament, { id }) => {
      // Update the specific tournament in cache
      queryClient.setQueryData(
        tournamentKeys.detail(id),
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
    mutationFn: (id: string) => tournamentService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: tournamentKeys.detail(id) });
      
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
    mutationFn: (tournamentId: string) => tournamentService.register(tournamentId),
    onSuccess: (_, tournamentId) => {
      // Invalidate tournament details and players
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
      queryClient.invalidateQueries({ queryKey: tournamentKeys.players(tournamentId) });
      
      toast({
        title: "Registration Successful",
        description: "You have been registered for the tournament.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to register for tournament');
      toast({
        title: "Registration Failed",
        description: "Failed to register for tournament. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Unregister from Tournament Mutation
export const useUnregisterFromTournament = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useUnregisterFromTournament' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (tournamentId: string) => tournamentService.unregister(tournamentId),
    onSuccess: (_, tournamentId) => {
      // Invalidate tournament details and players
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
      queryClient.invalidateQueries({ queryKey: tournamentKeys.players(tournamentId) });
      
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
