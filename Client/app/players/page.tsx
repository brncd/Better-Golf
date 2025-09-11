"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { PlayerTable } from "@/components/organisms/PlayerTable"
import { PlayerCard } from "@/components/molecules/PlayerCard"
import { usePlayers, useDeletePlayer } from "@/hooks/usePlayers"
import { PlayerListGetDTO } from "@/types"
import { Plus, Grid, List, Users } from "lucide-react"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"

export default function PlayersPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null)
  
  // Use TanStack Query for data fetching with caching
  const { data: playersResponse, isLoading, error } = usePlayers({ pageNumber: 1, pageSize: 50 })
  const deletePlayerMutation = useDeletePlayer()
  
  const players = (playersResponse as any)?.items || []

  const handleEdit = (id: number) => {
    router.push(`/players/${id}/edit`)
  }

  const handleDelete = (id: number) => {
    setDeletingPlayerId(id)
  }

  const confirmDelete = async () => {
    if (!deletingPlayerId) return
    deletePlayerMutation.mutate(deletingPlayerId.toString())
    setDeletingPlayerId(null)
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error instanceof Error ? error.message : 'An error occurred'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      )
    }

    if (players.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No players registered</h3>
          <p className="text-muted-foreground mb-4">Get started by registering your first player</p>
          <Button asChild>
            <Link href="/players/new">
              <Plus className="h-4 w-4 mr-2" />
              Register Player
            </Link>
          </Button>
        </div>
      )
    }

    if (viewMode === "table") {
      return <PlayerTable players={players} onEdit={handleEdit} onDelete={handleDelete} />
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player: PlayerListGetDTO) => (
          <PlayerCard key={player.id} player={player} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Players</h1>
            <p className="text-muted-foreground">Manage player registrations and information</p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            <Button asChild>
              <Link href="/players/new">
                <Plus className="h-4 w-4 mr-2" />
                Register Player
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Players</span>
            </div>
            <p className="text-2xl font-bold mt-1">{players.length}</p>
          </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={deletingPlayerId !== null}
          onOpenChange={(isOpen) => !isOpen && setDeletingPlayerId(null)}
          title="Delete Player"
          description="Are you sure you want to delete this player? This action cannot be undone."
          onConfirm={confirmDelete}
          variant="destructive"
        />
      </div>
    </MainLayout>
  )
}

