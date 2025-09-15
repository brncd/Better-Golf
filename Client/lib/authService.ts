import { apiClient } from './apiService';
import { logger } from './logger';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    logger.info('Login attempt', { emailOrUsername: credentials.emailOrUsername });
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },
  
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    logger.info('Registration attempt', { email: userData.email, username: userData.username });
    const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },
  
  logout: (): void => {
    logger.info('Logout');
    localStorage.removeItem('authToken');
  },
  
  getStoredToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },
  
  isAuthenticated: (): boolean => {
    const token = authService.getStoredToken();
    if (!token) return false;
    
    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },
  
  getUserFromToken: (): { email: string; username: string; roles: string[] } | null => {
    const token = authService.getStoredToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                   payload.role || [];
      const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
                   payload.email || '';
      const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                      payload.unique_name || payload.name || '';
      
      return {
        email,
        username,
        roles: Array.isArray(roles) ? roles : [roles]
      };
    } catch {
      return null;
    }
  }
};

// Legacy export for backward compatibility
export const authClient = authService;