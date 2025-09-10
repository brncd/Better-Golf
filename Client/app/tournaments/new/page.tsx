"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { TournamentForm } from "@/components/organisms/TournamentForm"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { tournamentService } from "@/lib/services"
import type { TournamentPostDTO } from "@/types"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewTournamentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: TournamentPostDTO) => {
    setIsLoading(true)
    setError(null)
    try {
      await tournamentService.create(data)
      router.push("/tournaments")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/tournaments")
  }

  return (
    <ProtectedRoute requiredRole="TournamentOrganizer">
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tournaments">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tournaments
              </Link>
            </Button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-balance">Create New Tournament</h1>
            <p className="text-muted-foreground">Set up a new golf tournament with all the details</p>
          </div>

          {/* Form */}
          <TournamentForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} error={error} />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
