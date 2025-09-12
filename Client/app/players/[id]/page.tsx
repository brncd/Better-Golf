"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HandicapBadge } from "@/components/atoms/HandicapBadge"
import { usePlayer } from "@/hooks/usePlayers"
import { usePlayerHistory } from "@/hooks/usePlayerHistory"
import { SinglePlayerDTO } from "@/types"
import { ArrowLeft, Edit, Calendar, Trophy, Target, Award, Medal, TrendingUp } from "lucide-react"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { Badge } from "@/components/ui/badge"

export default function PlayerDetailPage() {
  const params = useParams()
  const playerId = params.id as string

  // Use TanStack Query for data fetching with caching
  const { data: player, isLoading, error } = usePlayer(playerId)
  const { data: history, isLoading: historyLoading, error: historyError } = usePlayerHistory(parseInt(playerId))

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (name?: string, lastName?: string) => {
    if (!name || !lastName) return "??"
    return `${name[0]}${lastName[0]}`.toUpperCase()
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (isLoading) {
    return <MainLayout><LoadingSpinner /></MainLayout>
  }

  if (error) {
    return <MainLayout><div>Error: {error instanceof Error ? error.message : 'An error occurred'}</div></MainLayout>
  }

  if (!player) {
    return <MainLayout><div>Player not found</div></MainLayout>
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/players">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Players
            </Link>
          </Button>
        </div>

        {/* Player Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={`/abstract-geometric-shapes.png?height=96&width=96&query=${(player as any)?.firstName || ''}+${(player as any)?.lastName || ''}`}
              />
              <AvatarFallback className="text-2xl">{getInitials((player as any)?.firstName, (player as any)?.lastName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-balance">
                {(player as any)?.firstName || 'Unknown'} {(player as any)?.lastName || 'Player'}
              </h1>
              <div className="flex items-center gap-3">
                <HandicapBadge handicap={(player as any)?.handicapIndex || 0} />
              </div>
            </div>
          </div>

          <Button asChild>
            <Link href={`/players/${(player as any).id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Player
            </Link>
          </Button>
        </div>

        {/* Player Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Handicap</p>
                  <p className="text-xl font-bold">{((player as any)?.handicapIndex || 0).toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Matricula</p>
                  <p className="text-xl font-bold">{(player as any)?.matriculaAUG || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-xl font-bold">{calculateAge((player as any)?.birthdate) || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(player as any)?.birthdate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{formatDate((player as any)?.birthdate)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Golf Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Handicap</p>
                <p className="text-2xl font-bold">{((player as any)?.handicapIndex || 0).toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preferred Category</p>
                <p className="font-medium capitalize">{(player as any)?.isPreferredCategoryLadies ? "Ladies" : "Open"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournament History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Tournament Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {historyLoading ? (
                  <LoadingSpinner />
                ) : history ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tournaments</span>
                      <span className="font-bold">{history.totalTournaments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-bold">{history.completedTournaments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wins</span>
                      <span className="font-bold text-yellow-600">{history.wonTournaments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Top 3 Finishes</span>
                      <span className="font-bold text-orange-600">{history.top3Finishes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Score</span>
                      <span className="font-bold">{history.averageScore > 0 ? history.averageScore.toFixed(1) : 'N/A'}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No tournament data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tournament History List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Tournament History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <LoadingSpinner />
                ) : historyError ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Error loading tournament history</p>
                  </div>
                ) : history && history.tournaments.length > 0 ? (
                  <div className="space-y-4">
                    {history.tournaments.map((tournament) => (
                      <div key={tournament.tournamentId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{tournament.tournamentName}</h4>
                              <Badge variant="outline">{tournament.tournamentType}</Badge>
                              {tournament.position && tournament.position <= 3 && (
                                <Badge variant={tournament.position === 1 ? "default" : "secondary"}>
                                  <Medal className="h-3 w-3 mr-1" />
                                  #{tournament.position}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="capitalize">{tournament.status.toLowerCase()}</span>
                              {tournament.totalScore && (
                                <>
                                  <span>•</span>
                                  <span>Score: {tournament.totalScore}</span>
                                </>
                              )}
                              {tournament.stablefordPoints && (
                                <>
                                  <span>•</span>
                                  <span>Points: {tournament.stablefordPoints}</span>
                                </>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Rounds: {tournament.roundsPlayed}/{tournament.totalRounds}
                            </div>
                          </div>
                          <div className="text-right">
                            {tournament.position && (
                              <div className="text-lg font-bold">
                                #{tournament.position}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tournament history available</p>
                    <p className="text-sm mt-2">This player hasn't participated in any tournaments yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
