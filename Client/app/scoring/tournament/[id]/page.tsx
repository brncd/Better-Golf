"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { scoringService } from "@/lib/services/scoringService"
import { ScoringTournament, ScorecardDTO } from "@/types"
import { ArrowLeft, Trophy, Users, Target, Calendar } from "lucide-react"

export default function TournamentScoringPage() {
  const params = useParams()
  const tournamentId = parseInt(params.id as string)
  const [tournament, setTournament] = useState<ScoringTournament | null>(null)
  const [scorecards, setScorecards] = useState<ScorecardDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [tournamentData, scorecardsData] = await Promise.all([
          scoringService.getActiveTournaments(),
          scoringService.getTournamentScorecards(tournamentId.toString())
        ])
        
        const currentTournament = tournamentData.find(t => t.id === tournamentId)
        if (currentTournament) {
          setTournament(currentTournament)
        }
        setScorecards(scorecardsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tournament data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [tournamentId])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (error || !tournament) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Error Loading Tournament</h1>
          <p className="text-muted-foreground mb-4">{error || "Tournament not found"}</p>
          <Button asChild>
            <Link href="/scoring">Back to Scoring</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <ProtectedRoute requiredRole="Player">
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/scoring">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scoring
              </Link>
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-balance">{tournament.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(tournament.startDate).toLocaleDateString()}
                </Badge>
                <Badge variant="outline">
                  <Target className="h-3 w-3 mr-1" />
                  {tournament.tournamentType}
                </Badge>
              </div>
            </div>

            <Button asChild>
              <Link href={`/tournaments/${tournament.id}`}>
                <Trophy className="h-4 w-4 mr-2" />
                View Tournament
              </Link>
            </Button>
          </div>

          {/* Scorecards */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tournament Scorecards
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scorecards.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No scorecards available for this tournament yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {scorecards.map((scorecard) => (
                      <Card key={scorecard.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{scorecard.playerName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Round {scorecard.roundNumber} • Status: {scorecard.isLocked ? 'Locked' : 'In Progress'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/scoring/scorecard/${scorecard.id}`}>
                                View Scorecard
                              </Link>
                            </Button>
                            {!scorecard.isLocked && (
                              <Button size="sm" asChild>
                                <Link href={`/scoring/scorecard/${scorecard.id}/edit`}>
                                  Edit Scores
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
