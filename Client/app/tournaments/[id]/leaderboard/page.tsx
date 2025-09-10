"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Leaderboard } from "@/components/organisms/Leaderboard"
import { mockTournaments, mockTournamentRankings } from "@/data/mockData"
import { ArrowLeft, Target } from "lucide-react"

export default function TournamentLeaderboardPage() {
  const params = useParams()
  const tournamentId = params.id as string

  // In real app, this would fetch tournament and ranking data based on ID
  const tournament = mockTournaments.find((t) => t.id === tournamentId) || mockTournaments[0]
  const rankings = mockTournamentRankings

  return (
    <MainLayout>
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
            <h1 className="text-3xl font-bold text-balance">Live Leaderboard</h1>
            <p className="text-muted-foreground">{tournament.name}</p>
          </div>

          <Button asChild>
            <Link href={`/scoring/tournament/${tournament.id}`}>
              <Target className="h-4 w-4 mr-2" />
              Enter Scores
            </Link>
          </Button>
        </div>

        {/* Leaderboard */}
        <Leaderboard rankings={rankings} tournamentName={tournament.name} isLive={tournament.status === "active"} />
      </div>
    </MainLayout>
  )
}
