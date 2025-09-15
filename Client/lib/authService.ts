import { apiClient } from './apiService';
import { logger } from './logger';

export const authClient = {
  login: <T>(body: { emailOrUsername: string; password: string }) => {
    logger.info('Login attempt', { emailOrUsername: body.emailOrUsername });
    return apiClient.post<T>('/api/auth/login', body);
  },
  
  register: <T>(body: { username: string; email: string; password: string }) => {
    logger.info('Registration attempt', { email: body.email, username: body.username });
    return apiClient.post<T>('/api/auth/register', body);
  },
  
  getUserInfo: <T>() => {
    return apiClient.get<T>('/api/manage/info');
  },
  
  refresh: <T>(body: { refreshToken: string }) => {
    logger.info('Token refresh attempt');
    return apiClient.post<T>('/api/refresh', body);
  },
};