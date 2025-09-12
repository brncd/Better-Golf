"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { TournamentForm, TournamentFormState } from "@/components/organisms/TournamentForm"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { tournamentService } from "@/lib/services"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { getErrorMessage } from "@/lib/errors"
import type { TournamentPostDTO } from "@/types"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewTournamentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleError } = useErrorHandler({ context: 'Tournament Creation' })

  const handleSubmit = async (data: TournamentFormState) => {
    setIsLoading(true)
    setError(null)
    try {
      const tournamentData: TournamentPostDTO = {
        name: data.name,
        description: data.description || "",
        tournamentType: data.tournamentType,
        startDate: data.startDate,
        endDate: data.endDate,
        roundInfo: {
          startTime: data.roundInfo.startTime,
          endTime: data.roundInfo.endTime,
          intervalMinutes: data.roundInfo.intervalMinutes,
          maxPlayersPerGroup: data.roundInfo.maxPlayersPerGroup,
        },
        handicapAllowance: data.handicapAllowance ? data.handicapAllowance / 100 : undefined, // Convert percentage to decimal
      };

      console.log("Sending tournament data:", JSON.stringify(tournamentData, null, 2));
      await tournamentService.create(tournamentData)
      router.push("/tournaments")
    } catch (err) {
      console.error("Failed to create tournament:", err);
      // Use the improved error handling system
      handleError(err);
      
      // Extract user-friendly error message
      setError(getErrorMessage(err));
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