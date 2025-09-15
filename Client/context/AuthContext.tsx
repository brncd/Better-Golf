"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { authService } from '@/lib/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from stored JWT token
  useEffect(() => {
    const initializeAuth = () => {
      if (authService.isAuthenticated()) {
        const userData = authService.getUserFromToken();
        if (userData) {
          setUser(userData);
        } else {
          // Invalid token, clear it
          authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authService.login(credentials);
      return response;
    },
    onSuccess: (response) => {
      // Set user data from response
      setUser({
        email: response.email,
        username: response.username,
        roles: response.roles
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      const response = await authService.register(userData);
      return response;
    },
    onSuccess: (response) => {
      // Set user data from response
      setUser({
        email: response.email,
        username: response.username,
        roles: response.roles
      });
    },
  });

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    queryClient.clear();
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const isAdmin = (): boolean => {
    return hasRole('Admin');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loading,
    hasRole,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
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