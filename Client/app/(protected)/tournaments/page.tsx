"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { Plus } from "lucide-react"
import { TournamentsView } from "./TournamentsView"

export default function TournamentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Tournaments</h1>
          <p className="text-muted-foreground">Manage golf tournaments and competitions</p>
        </div>
        <RoleGuard roles={['Admin', 'TournamentOrganizer']}>
          <Button asChild>
            <Link href="/tournaments/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Link>
          </Button>
        </RoleGuard>
      </div>

      {/* Content */}
      <TournamentsView />
    </div>
  )
}
