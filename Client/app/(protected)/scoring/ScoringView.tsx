"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TournamentListGetDTO } from '@/types'
import { Trophy, Calendar, MapPin, Users, Target } from "lucide-react"

import { useQuery } from "@tanstack/react-query"
import { scoringService } from "@/lib/services/scoringService"

export function ScoringView() {
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['scoring', 'active-tournaments'],
    queryFn: () => scoringService.getActiveTournaments(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Scoring</h1>
        <p className="text-muted-foreground">Enter scores and view live tournament results</p>
      </div>

      {/* Active Tournaments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Tournaments</h2>

        {tournaments && tournaments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No active tournaments</h3>
              <p className="text-muted-foreground mb-4">There are currently no tournaments available for scoring</p>
              <Button asChild>
                <Link href="/tournaments">View All Tournaments</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments && tournaments.map((tournament: TournamentListGetDTO) => (
              <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-balance">{tournament.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                      {new Date(tournament.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{tournament.tournamentType}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{tournament.playerCount || 0} players</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{tournament.tournamentType.replace("-", " ")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                      <Link href={`/tournaments/${tournament.id}/leaderboard`}>
                        <Trophy className="h-4 w-4 mr-2" />
                        Leaderboard
                      </Link>
                    </Button>

                    <Button asChild className="flex-1">
                      <Link href={`/scoring/tournament/${tournament.id}`}>
                        <Target className="h-4 w-4 mr-2" />
                        Enter Scores
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
              <Link href="/tournaments" className="flex flex-col items-center gap-2">
                <Trophy className="h-8 w-8" />
                <span>View Tournaments</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
              <Link href="/players" className="flex flex-col items-center gap-2">
                <Users className="h-8 w-8" />
                <span>Manage Players</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
              <Link href="/courses" className="flex flex-col items-center gap-2">
                <MapPin className="h-8 w-8" />
                <span>View Courses</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
