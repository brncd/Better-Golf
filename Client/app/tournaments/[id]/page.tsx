"use client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { TournamentTypeBadge } from "@/components/atoms/TournamentTypeBadge"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { 
  useTournament, 
  useTournamentPlayers, 
  useTournamentRankings,
  useRegisterForTournament,
  useUnregisterFromTournament 
} from "@/hooks/useTournaments"
import { PlayerListGetDTO, TournamentRankingDTO } from "@/types"
import { ArrowLeft, Edit, Calendar, Users, Trophy, Clock, UserPlus, UserMinus } from "lucide-react"
import { useState } from "react"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { useAuth } from "@/context/AuthContext"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"

export default function TournamentDetailPage() {
  const params = useParams()
  const tournamentId = params.id as string

  const [showUnregisterDialog, setShowUnregisterDialog] = useState(false)
  
  const { user, hasRole } = useAuth()
  
  // Use TanStack Query hooks for data fetching with caching
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(tournamentId)
  const { data: playersResponse, isLoading: playersLoading } = useTournamentPlayers(tournamentId)
  const { data: rankings, isLoading: rankingsLoading } = useTournamentRankings(tournamentId)
  
  // Mutations for registration
  const registerMutation = useRegisterForTournament()
  const unregisterMutation = useUnregisterFromTournament()
  
  const players = (playersResponse as any)?.items || []
  const isLoading = tournamentLoading || playersLoading || rankingsLoading
  const rankingsData = (rankings as TournamentRankingDTO[]) || []
  
  // Check if current user is registered
  const isRegistered = user && players.some((player: PlayerListGetDTO) => player.email === user.email)

  const handleRegister = () => {
    if (!user) return;
    registerMutation.mutate(tournamentId);
  };

  const handleUnregister = () => {
    if (!user) return;
    setShowUnregisterDialog(true);
  };

  const confirmUnregister = () => {
    unregisterMutation.mutate(tournamentId);
    setShowUnregisterDialog(false);
  };

  const canRegister = () => {
    if (!tournament || !user || !hasRole('Player')) return false
    return (tournament as any).status === 'OpenRegistration' && !isRegistered
  }

  const canUnregister = () => {
    if (!tournament || !user || !hasRole('Player')) return false
    return (tournament as any).status === 'OpenRegistration' && isRegistered
  }

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

  if (tournamentError) {
    return <MainLayout><div>Error: {tournamentError instanceof Error ? tournamentError.message : 'An error occurred'}</div></MainLayout>
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
              <h1 className="text-3xl font-bold text-balance">{(tournament as any).name}</h1>
              <StatusBadge status="InProgress" />
            </div>
            <div className="flex items-center gap-2">
              <TournamentTypeBadge type={(tournament as any).tournamentType as any} />
            </div>
            {(tournament as any).description && <p className="text-muted-foreground max-w-2xl">{(tournament as any).description}</p>}
          </div>

          <div className="flex gap-2">
            <RoleGuard roles={["TournamentOrganizer", "Admin"]}>
              <Button variant="outline" asChild>
                <Link href={`/tournaments/${(tournament as any).id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Tournament
                </Link>
              </Button>
            </RoleGuard>
            <RoleGuard roles={["TournamentOrganizer", "Admin", "Player"]}>
              <Button asChild>
                <Link href={`/scoring/tournament/${(tournament as any).id}`}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Enter Scores
                </Link>
              </Button>
            </RoleGuard>
            
            {/* Registration buttons for players */}
            <RoleGuard roles={["Player"]}>
              {canRegister() && (
                <Button 
                  onClick={handleRegister}
                  disabled={registerMutation.isPending}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {registerMutation.isPending ? 'Registering...' : 'Register'}
                </Button>
              )}
              {canUnregister() && (
                <Button 
                  variant="outline"
                  onClick={handleUnregister}
                  disabled={unregisterMutation.isPending}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Unregister
                </Button>
              )}
            </RoleGuard>
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
                    {formatDate((tournament as any).startDate)} - {formatDate((tournament as any).endDate)}
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
                  <p className="text-2xl font-bold">{(tournament as any).count || 0}</p>
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
                  <p className="font-semibold capitalize">Active</p>
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
                  {players.map((player: any) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {player.firstName[0]}
                          {player.lastName[0]}
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
                {rankingsData.length > 0 ? (
                  <div className="space-y-2">
                    {rankingsData.map((ranking: any) => (
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
            <Card>
              <CardHeader>
                <CardTitle>Tournament Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tournament Type</p>
                    <p className="text-sm">
                      {(tournament as any).tournamentType}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Unregister Confirmation Dialog */}
      <ConfirmDialog
        open={showUnregisterDialog}
        onOpenChange={setShowUnregisterDialog}
        title="Confirm Unregistration"
        description="Are you sure you want to unregister from this tournament? This action cannot be undone."
        confirmLabel="Unregister"
        cancelLabel="Cancel"
        onConfirm={confirmUnregister}
        variant="destructive"
      />
    </MainLayout>
  )
}
