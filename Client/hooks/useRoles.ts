import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/lib/services/roleService';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from './use-toast';
import type { RoleAssignmentDTO, UserWithRoles } from '@/lib/services/roleService';

// Query Keys
export const roleKeys = {
  all: ['roles'] as const,
  assignments: () => [...roleKeys.all, 'assignments'] as const,
  users: () => [...roleKeys.all, 'users'] as const,
  user: (id: string) => [...roleKeys.users(), id] as const,
};

// All Users Query (Admin)
export const useAllUsers = () => {
  return useQuery({
    queryKey: roleKeys.users(),
    queryFn: () => roleService.getAllUsers(),
  });
};

// User Roles Query
export const useUserRoles = (userId: string) => {
  return useQuery({
    queryKey: roleKeys.user(userId),
    queryFn: () => roleService.getUserRoles(userId),
    enabled: !!userId,
  });
};

// Assign Role Mutation
export const useAssignRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      roleService.assignRole(userId, { roleName }),
    onSuccess: (_, { userId, roleName }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.users() });
      queryClient.invalidateQueries({ queryKey: roleKeys.user(userId) });
      
      toast({
        title: "Role Assigned",
        description: `Role ${roleName} has been assigned successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign role. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Remove Role Mutation
export const useRemoveRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) => 
      roleService.removeRole(userId, roleName),
    onSuccess: (_, { roleName }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      
      toast({
        title: "Role Removed",
        description: `Role ${roleName} has been removed successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove role. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Create Role Mutation
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (roleName: string) => roleService.createRole(roleName),
    onSuccess: (_, roleName) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      
      toast({
        title: "Role Created",
        description: `Role ${roleName} has been created successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      });
    },
  });
};
