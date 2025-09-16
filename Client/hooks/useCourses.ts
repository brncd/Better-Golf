'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/lib/services/courseService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';
import type { 
  CoursesListGetDTO, 
  SingleCourseDTO, 
  CoursePostDTO, 
  HoleListGetDTO,
  HolePostDTO,
  PaginationRequest,
  PaginationResponse 
} from '@/types';

// Query Keys
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (params: PaginationRequest) => [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: number) => [...courseKeys.details(), id] as const,
  holes: (courseId: number) => [...courseKeys.detail(courseId), 'holes'] as const,
};

// Get All Courses with Pagination
export const useCourses = (params: PaginationRequest, options?: { initialData?: PaginationResponse<CoursesListGetDTO> }) => {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => courseService.getAll(params),
    initialData: options?.initialData,
  });
};

// Get Single Course
export const useCourse = (courseId: number) => {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: async () => {
      console.log('Fetching course with ID:', courseId);
      try {
        const result = await courseService.getById(courseId);
        console.log('Course API response:', result);
        return result;
      } catch (error) {
        console.error('Course API error details:', error);
        throw error;
      }
    },
    enabled: !!courseId,
    retry: false, // Disable retry to see the actual error
  });
};

// Get Course Holes
export const useCourseHoles = (courseId: number) => {
  return useQuery({
    queryKey: courseKeys.holes(courseId),
    queryFn: () => courseService.getHoles(courseId),
    enabled: !!courseId,
  });
};

// Create Course Mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useCreateCourse' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: CoursePostDTO) => courseService.create(data),
    onSuccess: () => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      
      toast({
        title: "Course Created",
        description: "The course has been created successfully.",
      });
    },
    onError: (error) => {
      handleError(error);
      toast({
        title: "Creation Failed",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update Course Mutation
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useUpdateCourse' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CoursePostDTO }) => 
      courseService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific course and courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      
      toast({
        title: "Course Updated",
        description: "The course has been updated successfully.",
      });
    },
    onError: (error) => {
      handleError(error);
      toast({
        title: "Update Failed",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Delete Course Mutation
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useDeleteCourse' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (courseId: number) => courseService.delete(courseId),
    onSuccess: (_, courseId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      
      toast({
        title: "Course Deleted",
        description: "The course has been deleted successfully.",
      });
    },
    onError: (error) => {
      handleError(error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Add Hole to Course Mutation
export const useAddHole = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useAddHole' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: number; data: HolePostDTO }) => 
      courseService.addHole(courseId, data),
    onSuccess: (_, { courseId }) => {
      // Invalidate course holes and details
      queryClient.invalidateQueries({ queryKey: courseKeys.holes(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      
      toast({
        title: "Hole Added",
        description: "The hole has been added successfully.",
      });
    },
    onError: (error) => {
      handleError(error);
      toast({
        title: "Addition Failed",
        description: "Failed to add hole. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Remove Hole from Course Mutation
export const useRemoveHole = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({ context: 'useRemoveHole' });
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ courseId, holeId }: { courseId: number; holeId: number }) => 
      courseService.removeHole(courseId, holeId),
    onSuccess: (_, { courseId }) => {
      // Invalidate course holes and details
      queryClient.invalidateQueries({ queryKey: courseKeys.holes(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      
      toast({
        title: "Hole Removed",
        description: "The hole has been removed successfully.",
      });
    },
    onError: (error) => {
      handleError(error);
      toast({
        title: "Removal Failed",
        description: "Failed to remove hole. Please try again.",
        variant: "destructive",
      });
    },
  });
};
