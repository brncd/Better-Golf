import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { PlayerImportExport } from "@/components/players/PlayerImportExport"
import { Plus, Users } from "lucide-react"
import { PlayersView } from "./PlayersView"
import { playerService } from "@/lib/services"
import { ClientOnly } from "@/components/atoms/ClientOnly"

async function getPlayersData() {
  // Only fetch data if we're in a runtime environment with API access
  if (process.env.NODE_ENV === 'production' && !process.env.API_URL) {
    return []
  }
  
  try {
    const playersResponse = await playerService.getAll({ pageNumber: 1, pageSize: 100 })
    return playersResponse.items || []
  } catch (error) {
    // Gracefully handle API unavailability during build
    console.warn('API not available during build, using empty initial data')
    return []
  }
}

export default async function PlayersPage() {
  const initialPlayers = await getPlayersData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Players</h1>
          <p className="text-muted-foreground">Manage player registrations and information</p>
        </div>
        <div className="flex gap-2">
          <ClientOnly>
            <RoleGuard roles={['Admin', 'TournamentOrganizer']}>
              <PlayerImportExport />
              <Button asChild>
                <Link href="/players/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Player
                </Link>
              </Button>
            </RoleGuard>
          </ClientOnly>
        </div>
      </div>

      {/* Content */}
      <PlayersView initialPlayers={initialPlayers} />
    </div>
  )
}
