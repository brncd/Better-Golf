import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/lib/services/categoryService';
import { useToast } from './use-toast';
import type { Category, CategoryPostDTO, PaginationRequest } from '@/types';

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: PaginationRequest) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

// Get All Categories with Pagination
export const useCategories = (params: PaginationRequest = { pageNumber: 1, pageSize: 50 }) => {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.getAll(params),
  });
};

// Get Single Category
export const useCategory = (categoryId: number) => {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => categoryService.getById(categoryId),
    enabled: !!categoryId,
  });
};

// Create Category Mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: CategoryPostDTO) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast({
        title: "Category Created",
        description: "The category has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update Category Mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryPostDTO }) => 
      categoryService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast({
        title: "Category Updated",
        description: "The category has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Delete Category Mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (categoryId: number) => categoryService.delete(categoryId),
    onSuccess: (_, categoryId) => {
      queryClient.removeQueries({ queryKey: categoryKeys.detail(categoryId) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast({
        title: "Category Deleted",
        description: "The category has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    },
  });
};
