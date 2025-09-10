"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HandicapBadge } from "@/components/atoms/HandicapBadge"
import type { PlayerListGetDTO } from "@/types"
import { Eye, Edit, Trash2 } from "lucide-react"

interface PlayerCardProps {
  player: PlayerListGetDTO
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export function PlayerCard({ player, onEdit, onDelete }: PlayerCardProps) {

  const getInitials = (name: string, lastName: string) => {
    return `${name[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage
              src={`/abstract-geometric-shapes.png?height=48&width=48&query=${player.name}+${player.lastName}`}
            />
            <AvatarFallback>{getInitials(player.name, player.lastName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-balance leading-tight">
              {player.name} {player.lastName}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <HandicapBadge handicap={parseFloat(player.handicapIndex)} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <span className="truncate text-xs sm:text-sm" title={player.matriculaAUG.toString()}>
              Matricula: {player.matriculaAUG}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-3">
        <Button asChild variant="outline" size="sm" className="w-full sm:flex-1 bg-transparent">
          <Link href={`/players/${player.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Link>
        </Button>

        <div className="flex gap-2 w-full sm:w-auto">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(player.id)} className="flex-1 sm:flex-none">
              <Edit className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Edit</span>
            </Button>
          )}

          {onDelete && (
            <Button variant="outline" size="sm" onClick={() => onDelete(player.id)} className="flex-1 sm:flex-none">
              <Trash2 className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Delete</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
