import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/services';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from './use-toast';
import type { RoleAssignmentDTO, User } from '@/types';

// Query Keys
export const roleKeys = {
  all: ['roles'] as const,
  assignments: () => [...roleKeys.all, 'assignments'] as const,
  users: () => [...roleKeys.all, 'users'] as const,
  user: (id: string) => [...roleKeys.users(), id] as const,
};

// Role Assignments Query
export const useRoleAssignments = () => {
  const { handleError } = useErrorHandler({ context: 'useRoleAssignments' });
  
  return useQuery({
    queryKey: roleKeys.assignments(),
    queryFn: () => userService.getRoleAssignments(),
    onError: (error) => handleError(error, 'Failed to fetch role assignments'),
  });
};

// All Users Query (Admin)
export const useAllUsers = () => {
  const { handleError } = useErrorHandler({ context: 'useAllUsers' });
  
  return useQuery({
    queryKey: roleKeys.users(),
    queryFn: () => userService.getAllUsers(),
    onError: (error) => handleError(error, 'Failed to fetch users'),
  });
};

// Single User Query
export const useUser = (id: string) => {
  const { handleError } = useErrorHandler({ context: 'useUser' });
  
  return useQuery({
    queryKey: roleKeys.user(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
    onError: (error) => handleError(error, `Failed to fetch user ${id}`),
  });
};

// Update User Role Mutation
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useUpdateUserRole' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      userService.updateUserRole(userId, role),
    onSuccess: (_, { userId, role }) => {
      // Invalidate role assignments to refetch updated data
      queryClient.invalidateQueries({ queryKey: roleKeys.assignments() });
      
      // Update user in cache if it exists
      queryClient.invalidateQueries({ queryKey: roleKeys.user(userId) });
      
      toast({
        title: "Role Updated",
        description: `User role has been successfully updated to ${role}`,
      });
    },
    onError: (error, { userId }) => {
      handleError(error, `Failed to update role for user ${userId}`);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Deactivate User Mutation
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useDeactivateUser' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (userId: string) => userService.deactivateUser(userId),
    onSuccess: (_, userId) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: roleKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: roleKeys.users() });
      queryClient.invalidateQueries({ queryKey: roleKeys.user(userId) });
      
      toast({
        title: "User Deactivated",
        description: "User has been deactivated successfully.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to deactivate user');
      toast({
        title: "Error",
        description: "Failed to deactivate user. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Activate User Mutation
export const useActivateUser = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useActivateUser' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (userId: string) => userService.activateUser(userId),
    onSuccess: (_, userId) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: roleKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: roleKeys.users() });
      queryClient.invalidateQueries({ queryKey: roleKeys.user(userId) });
      
      toast({
        title: "User Activated",
        description: "User has been activated successfully.",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to activate user');
      toast({
        title: "Error",
        description: "Failed to activate user. Please try again.",
        variant: "destructive",
      });
    },
  });
};
