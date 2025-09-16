import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { Plus } from "lucide-react"
import { TournamentsView } from "./TournamentsView"
import { getTournamentsData } from "@/lib/server/tournamentData"
import { ClientOnly } from "@/components/atoms/ClientOnly"

export default async function TournamentsPage() {
  // Fetch tournaments data server-side to eliminate loading states
  const initialTournaments = await getTournamentsData(1, 20)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Tournaments</h1>
          <p className="text-muted-foreground">Manage golf tournaments and competitions</p>
        </div>
        <ClientOnly>
          <RoleGuard roles={['Admin', 'TournamentOrganizer']}>
            <Button asChild>
              <Link href="/tournaments/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Link>
            </Button>
          </RoleGuard>
        </ClientOnly>
      </div>

      {/* Content */}
      <TournamentsView initialTournaments={initialTournaments} />
    </div>
  )
}
