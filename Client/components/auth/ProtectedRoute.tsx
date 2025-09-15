"use client"

import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ClientOnly } from '@/components/atoms/ClientOnly';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = true, 
  fallback,
  redirectTo 
}: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const router = useRouter();

  // Handle redirects for unauthenticated users
  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [loading, requireAuth, isAuthenticated, redirectTo, router]);

  return (
    <ClientOnly fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    }>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      ) : requireAuth && !isAuthenticated ? (
        fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p className="text-muted-foreground">You need to be logged in to access this page.</p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        )
      ) : requiredRole && !hasRole(requiredRole) ? (
        fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have the required permissions to access this page.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )
      ) : (
        <>{children}</>
      )}
    </ClientOnly>
  );
}
