"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { TournamentTypeBadge } from "@/components/atoms/TournamentTypeBadge"
import type { TournamentListGetDTO } from "@/types"
import { Calendar, Users, Eye, Edit, Trash2 } from "lucide-react"

interface TournamentCardProps {
  tournament: TournamentListGetDTO
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export function TournamentCard({ tournament, onEdit, onDelete }: TournamentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-balance leading-tight min-w-0 flex-1">
            {tournament.name}
          </CardTitle>
          <div className="shrink-0">
            <StatusBadge status={tournament.status} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TournamentTypeBadge type={tournament.tournamentType as any} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">
              {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {tournament.playerCount} players
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-3">
        <Button asChild variant="outline" size="sm" className="w-full sm:flex-1 bg-transparent">
          <Link href={`/tournaments/${tournament.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Link>
        </Button>

        <div className="flex gap-2 w-full sm:w-auto">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(tournament.id)} className="flex-1 sm:flex-none">
              <Edit className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Edit</span>
            </Button>
          )}

          {onDelete && (
            <Button variant="outline" size="sm" onClick={() => onDelete(tournament.id)} className="flex-1 sm:flex-none">
              <Trash2 className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Delete</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
