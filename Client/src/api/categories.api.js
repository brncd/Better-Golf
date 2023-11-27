import axios from 'axios';

const categoriesApi = axios.create({
    baseURL: 'http://localhost:5001/api/categories'
});

export const getCategoryById = (id) => categoriesApi.get(`/${id}`);

export const createCategory = (categoryInfo) => categoriesApi.post('/', categoryInfo);

export const updateCategory = (id, categoryInfo) => categoriesApi.put(`/${id}`, categoryInfo);

export const deleteCategory = (id) => categoriesApi.delete(`/${id}`);

export const getAllCategory = () => categoriesApi.get('/');