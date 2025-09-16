"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTournaments, useDeleteTournament } from "@/hooks/useTournaments"
import type { TournamentListGetDTO, PaginationResponse } from "@/types"
import { Plus, Edit, Trash2, Users, Calendar, Grid, List } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";

interface TournamentsViewProps {
  initialTournaments?: PaginationResponse<TournamentListGetDTO>;
}

export function TournamentsView({ initialTournaments }: TournamentsViewProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [deletingTournamentId, setDeletingTournamentId] = useState<number | null>(null);
  const router = useRouter();
  const { data: tournamentsResponse, isLoading } = useTournaments({ pageNumber: 1, pageSize: 50 });
  const deleteTournamentMutation = useDeleteTournament();
  
  const tournaments = tournamentsResponse?.items || [];

  const handleEdit = (id: string) => {
    router.push(`/tournaments/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setDeletingTournamentId(Number(id));
  };

  const confirmDelete = () => {
    if (deletingTournamentId) {
      deleteTournamentMutation.mutate(deletingTournamentId);
      setDeletingTournamentId(null);
    }
  };

  const renderContent = () => {
    if (tournaments.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tournaments yet</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first tournament</p>
          <Button asChild>
            <Link href="/tournaments/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Link>
          </Button>
        </div>
      );
    }

    if (viewMode === "table") {
      return (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tournament</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.map((tournament: TournamentListGetDTO) => (
                <TableRow key={tournament.id}>
                  <TableCell>
                    <div>
                      <Link href={`/tournaments/${tournament.id}`} className="font-medium text-primary hover:underline">
                          {tournament.name}
                        </Link>
                      <div className="text-sm text-muted-foreground">{tournament.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tournament.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {tournament.playerCount || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {tournament.startDate ? format(new Date(tournament.startDate), 'MMM dd, yyyy') : 'TBD'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tournament.id.toString())}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(tournament.id.toString())}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {tournaments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tournaments found.
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament: TournamentListGetDTO) => (
          <Card key={tournament.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{tournament.name}</span>
                <Badge variant="outline">{tournament.status}</Badge>
              </CardTitle>
              <CardDescription>{tournament.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {tournament.playerCount || 0} players
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {tournament.startDate ? format(new Date(tournament.startDate), 'MMM dd') : 'TBD'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(tournament.id.toString())}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(tournament.id.toString())}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-2">
            <div className="flex border rounded-lg">
            <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-r-none"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-l-none"
            >
                <Grid className="h-4 w-4" />
            </Button>
            </div>
        </div>
        {renderContent()}
        <ConfirmDialog
            open={deletingTournamentId !== null}
            onOpenChange={(open) => !open && setDeletingTournamentId(null)}
            title="Delete Tournament"
            description="Are you sure you want to delete this tournament? This action cannot be undone."
            onConfirm={confirmDelete}
            variant="destructive"
        />
    </div>
  );
}
