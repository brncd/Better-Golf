import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { TournamentTypeBadge } from "@/components/atoms/TournamentTypeBadge"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { tournamentService } from "@/lib/services"
import { ArrowLeft, Edit, Calendar, Users, Trophy, Clock } from "lucide-react"
import { TournamentTabs } from "./TournamentTabs"
import { TournamentActions } from "./TournamentActions"

async function getTournamentData(id: number) {
  const tournament = await tournamentService.getById(id)
  const playersResponse = await tournamentService.getPlayers(id)
  const rankings = await tournamentService.getRankings(id)
  const rounds = await tournamentService.getRounds(id)
  return { 
    tournament, 
    players: playersResponse.items || [], 
    rankings: rankings || [], 
    rounds: rounds || [] 
  }
}

export default async function TournamentDetailPage({ params }: { params: { id: string } }) {
  const tournamentId = Number(params.id)
  const { tournament, players, rankings, rounds } = await getTournamentData(tournamentId)

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
            <h1 className="text-3xl font-bold text-balance">{tournament.name || 'Tournament'}</h1>
            <StatusBadge status={tournament.status || 'Draft'} />
          </div>
          <div className="flex items-center gap-2">
            <TournamentTypeBadge type={tournament.tournamentType as any} />
          </div>
          {tournament.description && <p className="text-muted-foreground max-w-2xl">{tournament.description}</p>}
        </div>

        <div className="flex gap-2">
          <RoleGuard roles={["TournamentOrganizer", "Admin"]}>
            <Button variant="outline" asChild>
              <Link href={`/tournaments/${tournament.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Tournament
              </Link>
            </Button>
          </RoleGuard>
          <RoleGuard roles={["TournamentOrganizer", "Admin", "Player"]}>
            <Button asChild>
              <Link href={`/scoring/tournament/${tournament.id}`}>
                <Trophy className="h-4 w-4 mr-2" />
                Enter Scores
              </Link>
            </Button>
          </RoleGuard>
          <TournamentActions tournament={tournament} players={players} />
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
                <p className="text-2xl font-bold">{players.length || 0}</p>
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

      <TournamentTabs tournament={tournament} players={players} rankings={rankings} rounds={rounds} />
    </div>
  )
}
