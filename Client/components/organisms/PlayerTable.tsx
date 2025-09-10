"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HandicapBadge } from "@/components/atoms/HandicapBadge"
import type { PlayerListGetDTO } from "@/types"
import { Eye, Edit, Trash2, Search } from "lucide-react"

interface PlayerTableProps {
  players: PlayerListGetDTO[]
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export function PlayerTable({ players, onEdit, onDelete }: PlayerTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPlayers = players.filter((player) => {
    const fullName = `${player.name} ${player.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      player.matriculaAUG.toString().includes(searchTerm)
    return matchesSearch
  })

  const getInitials = (name: string, lastName: string) => {
    return `${name[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search players by name or matricula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Matricula</TableHead>
              <TableHead>Handicap</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No players found
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/abstract-geometric-shapes.png?height=32&width=32&query=${player.name}+${player.lastName}`}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(player.name, player.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {player.name} {player.lastName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{player.matriculaAUG}</div>
                  </TableCell>
                  <TableCell>
                    <HandicapBadge handicap={parseFloat(player.handicapIndex)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/players/${player.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(player.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      {onDelete && (
                        <Button variant="ghost" size="sm" onClick={() => onDelete(player.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

