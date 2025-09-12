import { apiClient } from '../apiService';
import type { 
  CourseListGetDTO, 
  SingleCourseDTO, 
  CoursePostDTO, 
  HoleListGetDTO,
  HolePostDTO,
  PaginationRequest, 
  PaginationResponse 
} from '@/types';

export const courseService = {
  // Get all courses with pagination
  getAll: (pagination?: PaginationRequest): Promise<PaginationResponse<CourseListGetDTO>> =>
    apiClient.get(`/api/Courses?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Get course by ID - Fixed: API uses number IDs, not string
  getById: (id: number): Promise<SingleCourseDTO> =>
    apiClient.get(`/api/Courses/${id}`),

  getByIdWithHoles: (id: number): Promise<SingleCourseDTO> =>
    apiClient.get(`/api/Courses/${id}/holes`),

  // Create new course (Admin only)
  create: (course: CoursePostDTO): Promise<SingleCourseDTO> =>
    apiClient.post('/api/Courses', course),

  // Update course (Admin only) - Fixed: API uses number IDs
  update: (id: number, course: CoursePostDTO): Promise<void> =>
    apiClient.put(`/api/Courses/${id}`, course),

  // Delete course (Admin only) - Fixed: API uses number IDs
  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/Courses/${id}`),

  // Get course holes - Fixed: Course ID is number
  getHoles: (id: number, pagination?: PaginationRequest): Promise<PaginationResponse<HoleListGetDTO>> =>
    apiClient.get(`/api/Courses/${id}/Holes?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 18}`),

  // Add hole to course (Admin only) - Fixed: Course ID is number
  addHole: (id: number, hole: HolePostDTO): Promise<void> =>
    apiClient.post(`/api/Courses/${id}/Holes`, hole),

  // Remove hole from course (Admin only) - Fixed: Both IDs are numbers
  removeHole: (courseId: number, holeId: number): Promise<void> =>
    apiClient.delete(`/api/Courses/${courseId}/Holes/${holeId}`),
};
