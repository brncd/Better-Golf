"use client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { TournamentTypeBadge } from "@/components/atoms/TournamentTypeBadge"
import { apiClient } from "@/lib/apiService"
import { SingleTournamentDTO, PlayerListGetDTO, TournamentRankingDTO, PaginationResponse } from "@/types"
import { ArrowLeft, Edit, Calendar, MapPin, Users, Trophy, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"

export default function TournamentDetailPage() {
  const params = useParams()
  const tournamentId = params.id as string

  const [tournament, setTournament] = useState<SingleTournamentDTO | null>(null)
  const [players, setPlayers] = useState<PlayerListGetDTO[]>([])
  const [rankings, setRankings] = useState<TournamentRankingDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tournamentId) return;

    const fetchTournamentData = async () => {
      try {
        setIsLoading(true)
        const tournamentData = await apiClient.get<SingleTournamentDTO>(`/Tournaments/${tournamentId}`)
        setTournament(tournamentData)

        const playersData = await apiClient.get<PaginationResponse<PlayerListGetDTO>>(`/Tournaments/${tournamentId}/Players`)
        setPlayers(playersData.items)

        const rankingsData = await apiClient.get<TournamentRankingDTO[]>(`/TournamentRankings/${tournamentId}`)
        setRankings(rankingsData)

      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTournamentData()
  }, [tournamentId])

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return <MainLayout><LoadingSpinner /></MainLayout>
  }

  if (error) {
    return <MainLayout><div>Error: {error}</div></MainLayout>
  }

  if (!tournament) {
    return <MainLayout><div>Tournament not found</div></MainLayout>
  }

  return (
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

        {/* Tournament Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-balance">{tournament.name}</h1>
              <StatusBadge status={tournament.status as any} />
            </div>
            <div className="flex items-center gap-2">
              <TournamentTypeBadge type={tournament.tournamentType as any} />
            </div>
            {tournament.description && <p className="text-muted-foreground max-w-2xl">{tournament.description}</p>}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/tournaments/${tournament.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Tournament
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/scoring/tournament/${tournament.id}`}>
                <Trophy className="h-4 w-4 mr-2" />
                Enter Scores
              </Link>
            </Button>
          </div>
        </div>

        {/* Tournament Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">
                    {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Players</p>
                  <p className="font-semibold">
                    {tournament.count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{tournament.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="players" className="space-y-4">
          <TabsList>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="rounds">Rounds</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registered Players ({players.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {player.name[0]}
                          {player.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {player.name} {player.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Handicap: {player.handicapIndex}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rounds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Rounds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Round scheduling will be available once the tournament begins</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                {rankings.length > 0 ? (
                  <div className="space-y-2">
                    {rankings.map((ranking) => (
                      <div key={ranking.playerId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{ranking.position}</span>
                          </div>
                          <div>
                            <p className="font-medium">Player ID: {ranking.playerId}</p>
                            <p className="text-sm text-muted-foreground">Strokes: {ranking.totalStrokes}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {ranking.totalStrokes}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Leaderboard will be available once scoring begins</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tournament Type</p>
                    <p className="text-sm">
                      {tournament.tournamentType}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
