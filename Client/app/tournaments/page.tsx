"use client"

import { useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { TournamentTable } from "@/components/organisms/TournamentTable";
import { TournamentCard } from "@/components/molecules/TournamentCard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useTournaments, useDeleteTournament } from "@/hooks/useTournaments";
import { TournamentListGetDTO } from "@/types";
import { Plus, Grid, List } from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

export default function TournamentsPage() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  // Use TanStack Query for data fetching with caching
  const { data: tournamentsResponse, isLoading, error } = useTournaments({ pageNumber: 1, pageSize: 50 });
  const deleteTournamentMutation = useDeleteTournament();
  
  const tournaments = tournamentsResponse?.items || [];

  const handleEdit = (id: string) => {
    window.location.href = `/tournaments/${id}/edit`;
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this tournament?")) {
      deleteTournamentMutation.mutate(id);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error instanceof Error ? error.message : 'An error occurred'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      );
    }

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
      return <TournamentTable tournaments={tournaments} onEdit={handleEdit} onDelete={handleDelete} />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Tournaments</h1>
            <p className="text-muted-foreground">Manage and view all golf tournaments</p>
          </div>

          <div className="flex items-center gap-2">
            <RoleGuard roles={["TournamentOrganizer", "Admin"]}>
              <Button asChild>
                <Link href="/tournaments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Tournament
                </Link>
              </Button>
            </RoleGuard>

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
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </MainLayout>
  );
}
