"use client"

import { useAuth } from '@/context/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function RoleGuard({ 
  children, 
  roles = [], 
  requireAll = false, 
  fallback = null 
}: RoleGuardProps) {
  const { hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (roles.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = requireAll 
    ? roles.every(role => hasRole(role))
    : roles.some(role => hasRole(role));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
