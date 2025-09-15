"use client"

import { QueryProvider } from "@/providers/QueryProvider"
import { AuthProvider } from "@/context/AuthContext"
import { ErrorBoundary } from "@/components/atoms/ErrorBoundary"
import type { User } from "@/types"

interface ProvidersProps {
  children: React.ReactNode
  initialUser?: User | null
}

export function Providers({ children, initialUser }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider initialUser={initialUser}>
          {children}
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}
