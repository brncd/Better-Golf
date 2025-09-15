"use client"

import { QueryProvider } from "@/providers/QueryProvider"
import { AuthProvider } from "@/context/AuthContext"
import { ErrorBoundary } from "@/components/atoms/ErrorBoundary"
import type { User } from "@/types"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}
