"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ErrorDisplay } from "@/components/atoms/ErrorDisplay"
import { TeeTimesManager } from "@/components/tournaments/TeeTimesManager"
import { useTournament } from "@/hooks/useTournaments"
import { useAuth } from "@/context/AuthContext"
import { ArrowLeft } from "lucide-react"

export default function TeeTimesPage() {
  const params = useParams()
  const tournamentId = params.id as string
  const { user } = useAuth()

  const { data: tournament, isLoading, error } = useTournament(tournamentId)

  const canEdit = user?.roles?.includes('Admin') || user?.roles?.includes('TournamentOrganizer')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorDisplay error={error} />
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/tournaments/${tournament.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournament
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tee Times Management</h1>
          <p className="text-muted-foreground">{tournament.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(tournament.startDate.toString())}
          </p>
        </div>
      </div>

      {/* Tee Times Manager Component */}
      <TeeTimesManager tournamentId={tournamentId} canEdit={canEdit} />
    </div>
  )
}
