// Used to make calls to the backend for courses
import axios from 'axios';

const courseApi = axios.create({
	baseURL: 'http://localhost:5001/api/courses',
});

export const getAllCourses = () => courseApi.get('/');

export const getCourseById = (id) => courseApi.get(`/${id}`);

export const getHolesInCourses = (id) => courseApi.get(`/${id}/holes`);

export const createCourse = (course) => courseApi.post('/', course);

export const deleteCourse = (id) => courseApi.delete(`/${id}`);

export const updateCourse = (id, course) => courseApi.put(`/${id}`, course);

export const deleteHolesInCourses = (tid, pid) => courseApi.delete(`/${tid}/holes/${pid}?courseId=${tid}`);

export const addHole = (id, hole) => courseApi.post(`/${id}/holes`, hole);

export const addHoleToCourse = (tid, course) => courseApi.post(`/${tid}/holes`, course);

export const updateHoleInCourse = (tid, holeid, hole) => courseApi.put(`/${tid}/holes/${holeid}?courseId=${tid}&holeId=${holeid}`, hole);
