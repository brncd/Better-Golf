"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/atoms/StatusBadge"
import { TournamentTypeBadge } from "@/components/atoms/TournamentTypeBadge"
import { RoleGuard } from "@/components/auth/RoleGuard"
import type { TournamentListGetDTO } from "@/types"
import { Eye, Edit, Trash2, Search } from "lucide-react"

interface TournamentTableProps {
  tournaments: TournamentListGetDTO[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function TournamentTable({ tournaments, onEdit, onDelete }: TournamentTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = statusFilter === "all" || tournament.tournamentType === statusFilter
    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tournaments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="OpenRegistration">Open Registration</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tournament</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Players</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTournaments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No tournaments found
                </TableCell>
              </TableRow>
            ) : (
              filteredTournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tournament.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{tournament.tournamentType}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{tournament.tournamentType}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{formatDate(tournament.startDate)}</div>
                    <div className="text-muted-foreground">to {formatDate(tournament.endDate)}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {tournament.playerCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/tournaments/${tournament.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      <RoleGuard roles={["TournamentOrganizer", "Admin"]}>
                        {onEdit && (
                          <Button variant="ghost" size="sm" onClick={() => onEdit(tournament.id.toString())}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        {onDelete && (
                          <Button variant="ghost" size="sm" onClick={() => onDelete(tournament.id.toString())}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </RoleGuard>
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
