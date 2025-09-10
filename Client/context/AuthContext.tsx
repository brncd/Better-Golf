"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '@/lib/authService';
import type { User, AuthResponse, LoginRequest } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({ email: payload.email, roles: payload.role || [] });
      } catch (e) {
        console.error("Failed to decode token", e);
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authClient.login<AuthResponse>(credentials);
      const newToken = response.accessToken;
      
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      
      try {
        const payload = JSON.parse(atob(newToken.split('.')[1]));
        setUser({ email: payload.email, roles: payload.role || [] });
      } catch (e) {
        console.error("Failed to decode token", e);
        setUser({ email: credentials.email, roles: [] });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!user,
      loading: isLoading, 
      error 
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
