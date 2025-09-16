"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { useAuth } from "@/context/AuthContext"
import dynamic from "next/dynamic"
import { SingleTournamentDTO, PlayerListGetDTO, TournamentRankingDTO, RoundDTO } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const RegistrationManagement = dynamic(() => import("@/components/tournaments/RegistrationManagement").then(mod => mod.RegistrationManagement))
const TeeTimesManagement = dynamic(() => import("@/components/tournaments/TeeTimesManagement").then(mod => mod.TeeTimesManagement))
const TournamentLifecycleControls = dynamic(() => import("@/components/tournaments/TournamentLifecycleControls").then(mod => mod.TournamentLifecycleControls))

interface TournamentTabsProps {
  tournament: SingleTournamentDTO
  players: PlayerListGetDTO[]
  rankings: TournamentRankingDTO[]
  rounds: RoundDTO[]
}

export function TournamentTabs({ tournament, players, rankings, rounds }: TournamentTabsProps) {
  const { hasRole } = useAuth()

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Tabs defaultValue="players" className="space-y-4">
      <TabsList>
        <TabsTrigger value="players">Players</TabsTrigger>
        <RoleGuard roles={["TournamentOrganizer", "Admin"]}>
          <TabsTrigger value="registration">Registration</TabsTrigger>
        </RoleGuard>
        <RoleGuard roles={["TournamentOrganizer", "Admin"]}>
          <TabsTrigger value="teetimes">Tee Times</TabsTrigger>
        </RoleGuard>
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
              {players.map((player: PlayerListGetDTO) => (
                <div key={player.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {player.firstName?.[0] || 'A'}
                      {player.lastName?.[0] || 'B'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Handicap: {player.handicap}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <RoleGuard roles={["TournamentOrganizer", "Admin"]}>
        <TabsContent value="registration" className="space-y-4">
          <RegistrationManagement 
            tournamentId={tournament.id}
            tournamentStatus={tournament.status || 'Draft'}
            canManage={hasRole('TournamentOrganizer') || hasRole('Admin')}
          />
        </TabsContent>
      </RoleGuard>

      <RoleGuard roles={["TournamentOrganizer", "Admin"]}>
        <TabsContent value="teetimes" className="space-y-4">
          <TeeTimesManagement 
            tournament={tournament}
            canManage={hasRole('TournamentOrganizer') || hasRole('Admin')}
          />
        </TabsContent>
      </RoleGuard>

      <TabsContent value="rounds" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tournament Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            {rounds && rounds.length > 0 ? (
              <div className="space-y-4">
                {rounds.map((round: RoundDTO) => (
                  <div key={round.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <span className="font-bold text-lg">{round.roundNumber}</span>
                      </div>
                      <div>
                        <p className="font-semibold">Round {round.roundNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(round.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rounds have been scheduled for this tournament yet.</p>
              </div>
            )}
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
                {rankings.map((ranking: TournamentRankingDTO) => (
                  <div key={ranking.playerId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{ranking.position}</span>
                      </div>
                      <div>
                        <p className="font-medium">{ranking.playerName}</p>
                        <p className="text-sm text-muted-foreground">Strokes: {ranking.totalScore}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        <Badge variant="outline">{ranking.totalScore} strokes</Badge>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tournament Type</p>
                  <p className="text-sm">
                    {tournament.tournamentType || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <RoleGuard roles={["TournamentOrganizer", "Admin"]}>
            <TournamentLifecycleControls 
              tournament={tournament}
              canManage={hasRole('TournamentOrganizer') || hasRole('Admin')}
            />
          </RoleGuard>
        </div>
      </TabsContent>
    </Tabs>
  )
}
