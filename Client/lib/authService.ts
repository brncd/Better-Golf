import { apiClient } from './apiService';
import { logger } from './logger';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    logger.info('Login attempt', { emailOrUsername: credentials.emailOrUsername });
    return await apiClient.post<AuthResponse>('/api/auth/login', credentials);
  },
  
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    logger.info('Registration attempt', { email: userData.email, username: userData.username });
    return await apiClient.post<AuthResponse>('/api/auth/register', userData);
  },
  
  logout: async (): Promise<void> => {
    logger.info('Logout');
    await apiClient.post('/api/auth/logout');
  },
  
  me: async (): Promise<{ isAuthenticated: boolean; email?: string; username?: string; roles?: string[] }> => {
    return await apiClient.get('/api/me');
  }
};

// Legacy export for backward compatibility
export const authClient = authService;
