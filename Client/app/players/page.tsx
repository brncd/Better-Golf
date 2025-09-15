"use client"

import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { PlayerImportExport } from "@/components/players/PlayerImportExport"
import { Plus, Users } from "lucide-react"
import { PlayersView } from "./PlayersView"

export default function PlayersPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Players</h1>
            <p className="text-muted-foreground">Manage player registrations and information</p>
          </div>
          <div className="flex gap-2">
            <RoleGuard roles={['Admin', 'TournamentOrganizer']}>
              <PlayerImportExport onImportComplete={(count) => {
                console.log(`${count} players imported`)
              }} />
              <Button asChild>
                <Link href="/players/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Player
                </Link>
              </Button>
            </RoleGuard>
          </div>
        </div>

        {/* Content */}
        <PlayersView />
      </div>
    </MainLayout>
  )
}
