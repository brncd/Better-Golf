"use client"

import { MainLayout } from "@/components/layouts/MainLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <MainLayout user={user}>
        {children}
      </MainLayout>
    </ProtectedRoute>
  )
}