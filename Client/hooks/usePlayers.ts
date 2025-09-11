import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerService } from '@/lib/services';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from './use-toast';
import type { 
  PlayerListGetDTO, 
  SinglePlayerDTO, 
  PlayerPostDTO, 
  PlayerProfileDTO,
  PaginationRequest,
  PaginationResponse 
} from '@/types';

// Query Keys
export const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (filters: PaginationRequest) => [...playerKeys.lists(), filters] as const,
  details: () => [...playerKeys.all, 'detail'] as const,
  detail: (id: string) => [...playerKeys.details(), id] as const,
  profile: () => [...playerKeys.all, 'profile'] as const,
};

// Players List Query
export const usePlayers = (params?: PaginationRequest) => {
  const { handleError } = useErrorHandler({ context: 'usePlayers' });
  
  return useQuery({
    queryKey: playerKeys.list(params || {}),
    queryFn: () => playerService.getAll(params),
    onError: (error) => handleError(error, 'Failed to fetch players'),
  });
};

// Single Player Query
export const usePlayer = (id: string) => {
  const { handleError } = useErrorHandler({ context: 'usePlayer' });
  
  return useQuery({
    queryKey: playerKeys.detail(id),
    queryFn: () => playerService.getById(id),
    enabled: !!id,
    onError: (error) => handleError(error, `Failed to fetch player ${id}`),
  });
};

// Current User Profile Query
export const useMyProfile = () => {
  const { handleError } = useErrorHandler({ context: 'useMyProfile' });
  
  return useQuery({
    queryKey: playerKeys.profile(),
    queryFn: () => playerService.getMyProfile(),
    onError: (error) => handleError(error, 'Failed to fetch your profile'),
  });
};

// Create Player Mutation
export const useCreatePlayer = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useCreatePlayer' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (player: PlayerPostDTO) => playerService.create(player),
    onSuccess: (newPlayer) => {
      // Invalidate and refetch players list
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
      
      toast({
        title: "Player Created",
        description: `${newPlayer.firstName} ${newPlayer.lastName} has been created successfully.`,
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to create player');
      toast({
        title: "Error",
        description: "Failed to create player. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update Player Mutation
export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useUpdatePlayer' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, player }: { id: string; player: Partial<PlayerPostDTO> }) =>
      playerService.update(id, player),
    onSuccess: (updatedPlayer, { id }) => {
      // Update the specific player in cache
      queryClient.setQueryData(
        playerKeys.detail(id),
        updatedPlayer
      );
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
      
      toast({
        title: "Player Updated",
        description: "Player has been updated successfully.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to update player');
      toast({
        title: "Error",
        description: "Failed to update player. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update My Profile Mutation
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useUpdateMyProfile' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (profile: Partial<PlayerProfileDTO>) => playerService.updateMyProfile(profile),
    onSuccess: (updatedProfile) => {
      // Update profile in cache
      queryClient.setQueryData(playerKeys.profile(), updatedProfile);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to update your profile');
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Delete Player Mutation
export const useDeletePlayer = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useDeletePlayer' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => playerService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: playerKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
      
      toast({
        title: "Player Deleted",
        description: "Player has been deleted successfully.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to delete player');
      toast({
        title: "Error",
        description: "Failed to delete player. Please try again.",
        variant: "destructive",
      });
    },
  });
};
