"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '@/lib/authService';
import { logger } from '@/lib/logger';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { User, AuthResponse, LoginRequest } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isTournamentOrganizer: () => boolean;
  isPlayer: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || [];
          const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email || '';
          const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.unique_name || payload.name || '';
          
          setUser({ 
            email: email, 
            username: username,
            roles: Array.isArray(roles) ? roles : [roles] 
          });
        } catch (e) {
          console.error("Failed to decode token", e);
          localStorage.removeItem('authToken');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authClient.login<AuthResponse>(credentials);
      const newToken = response.token;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', newToken);
      }
      setToken(newToken);
      
      setUser({ 
        email: response.email, 
        username: response.username,
        roles: response.roles || [] 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    setUser(null);
    setToken(null);
    setError(null);
    logger.authSuccess('User logged out');
  };

  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return Array.isArray(user.roles) ? user.roles.includes(role) : user.roles === role;
  };

  const isAdmin = (): boolean => hasRole('Admin');
  const isTournamentOrganizer = (): boolean => hasRole('TournamentOrganizer');
  const isPlayer = (): boolean => hasRole('Player');

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!user,
      loading: isLoading, 
      error,
      hasRole,
      isAdmin,
      isTournamentOrganizer,
      isPlayer
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
