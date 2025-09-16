"use client"

import { useRouter } from "next/navigation"
import { TournamentForm } from "@/components/organisms/TournamentForm"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTournament, useUpdateTournament } from "@/hooks/useTournaments"
import type { TournamentPostDTO, SingleTournamentDTO } from "@/types"
import type { TournamentFormState } from "@/components/organisms/TournamentForm"

interface EditTournamentPageProps {
  params: { id: string }
}

export default function EditTournamentPage({ params }: EditTournamentPageProps) {
  const router = useRouter()
  const tournamentId = parseInt(params.id)
  
  // Use TanStack Query to fetch tournament data
  const { data: tournament, isLoading, error } = useTournament(tournamentId)
  const updateTournamentMutation = useUpdateTournament()

  // Utility to convert minutes from midnight to HH:mm string
  const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleSubmit = async (data: TournamentFormState) => {
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
        handicapAllowance: data.handicapAllowance ? data.handicapAllowance / 100 : undefined,
      }
      
      await updateTournamentMutation.mutateAsync({
        id: tournamentId,
        data: tournamentData
      })
      router.push(`/tournaments/${params.id}`)
    } catch (err) {
      console.error("Error updating tournament:", err)
      // Error handling is done in the TournamentForm component
    }
  }

  const handleCancel = () => {
    router.push(`/tournaments/${params.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Error Loading Tournament</h1>
        <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Failed to load tournament'}</p>
        <Button asChild>
          <Link href="/tournaments">Back to Tournaments</Link>
        </Button>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
        <Button asChild>
          <Link href="/tournaments">Back to Tournaments</Link>
        </Button>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole="TournamentOrganizer">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/tournaments/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Tournament</h1>
            <p className="text-muted-foreground">Update tournament details and settings</p>
          </div>
        </div>

        <TournamentForm 
          initialData={{
            name: tournament.name,
            description: tournament.description,
            tournamentType: tournament.tournamentType,
            courseId: tournament.courseId,
            startDate: tournament.startDate,
            endDate: tournament.endDate,
            handicapAllowance: tournament.handicapAllowance ? tournament.handicapAllowance * 100 : 100,
            roundInfo: {
              startTime: tournament.roundInfo ? minutesToTime(tournament.roundInfo.firstRoundTime) : "08:00",
              endTime: tournament.roundInfo ? minutesToTime(tournament.roundInfo.endTime) : "16:00",
              intervalMinutes: tournament.roundInfo?.interval || 10,
              maxPlayersPerGroup: tournament.roundInfo?.maxPlayersPerGroup || 4,
            }
          }}
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          isLoading={updateTournamentMutation.isPending}
          error={updateTournamentMutation.error?.message}
        />
      </div>
    </ProtectedRoute>
  )
}
