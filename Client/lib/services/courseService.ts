import { apiClient } from '../apiService';
import type { 
  CoursesListGetDTO, 
  SingleCourseDTO, 
  CoursePostDTO, 
  CourseDetailGetDTO,
  PaginationRequest, 
  PaginationResponse 
} from '@/types';

export const courseService = {
  // Get all courses with pagination
  getAll: (pagination?: PaginationRequest): Promise<PaginationResponse<CoursesListGetDTO>> =>
    apiClient.get(`/api/Courses?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 10}`),

  // Get course by ID
  async getById(id: string): Promise<SingleCourseDTO> {
    const response = await apiClient.get(`/api/Courses/${id}`)
    return response.data
  },

  async getByIdWithHoles(id: string): Promise<CourseDetailGetDTO> {
    const response = await apiClient.get(`/api/Courses/${id}/holes`)
    return response.data
  },

  // Create new course (Admin only)
  create: (course: CoursePostDTO): Promise<SingleCourseDTO> =>
    apiClient.post('/api/Courses', course),

  // Update course (Admin only)
  update: (id: string, course: CoursePostDTO): Promise<void> =>
    apiClient.put(`/api/Courses/${id}`, course),

  // Delete course (Admin only)
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/Courses/${id}`),

  // Get course holes
  getHoles: (id: string, pagination?: PaginationRequest): Promise<PaginationResponse<HoleListGetDTO>> =>
    apiClient.get(`/api/Courses/${id}/Holes?pageNumber=${pagination?.pageNumber || 1}&pageSize=${pagination?.pageSize || 18}`),

  // Add hole to course (Admin only)
  addHole: (id: string, hole: HolePostDTO): Promise<void> =>
    apiClient.post(`/api/Courses/${id}/Holes`, hole),

  // Remove hole from course (Admin only)
  removeHole: (courseId: string, holeId: string): Promise<void> =>
    apiClient.delete(`/api/Courses/${courseId}/Holes/${holeId}`),
};
