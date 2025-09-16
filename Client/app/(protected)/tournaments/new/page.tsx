"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TournamentForm, TournamentFormState } from "@/components/organisms/TournamentForm"
import { useCreateTournament } from "@/hooks/useTournaments"
import { getErrorMessage } from "@/lib/errors"
import type { TournamentPostDTO } from "@/types"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewTournamentPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const createTournamentMutation = useCreateTournament()

  const handleSubmit = async (data: TournamentFormState) => {
    setError(null)
    try {
      const tournamentData: TournamentPostDTO = {
        name: data.name,
        description: data.description || "",
        tournamentType: data.tournamentType,
        courseId: data.courseId!,
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
      await createTournamentMutation.mutateAsync(tournamentData)
      router.push("/tournaments")
    } catch (err) {
      console.error("Failed to create tournament:", err);
      setError(getErrorMessage(err));
    }
  }

  const handleCancel = () => {
    router.push("/tournaments")
  }

  return (
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
        <h1 className="text-3xl font-bold text-balance">Create Tournament</h1>
        <p className="text-muted-foreground">Set up a new golf tournament</p>
      </div>

      {/* Form */}
      <TournamentForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={createTournamentMutation.isPending} error={error} />
    </div>
  )
}
