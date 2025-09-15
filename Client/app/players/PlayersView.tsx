"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlayerTable } from "@/components/players/PlayerTable"
import { PlayerCard } from "@/components/players/PlayerCard"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ErrorDisplay } from "@/components/atoms/ErrorDisplay"
import { usePlayers, useDeletePlayer } from "@/hooks/usePlayers"
import { PlayerListGetDTO } from "@/types"
import { Plus, Users, Grid, List } from "lucide-react"

export function PlayersView() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null)
  
  // TanStack Query hooks
  const { data: playersData, isLoading, error, refetch } = usePlayers({ pageNumber: 1, pageSize: 100 })
  const deletePlayerMutation = useDeletePlayer()

  const players = (playersData as any)?.items || []

  const handleEdit = (player: PlayerListGetDTO) => {
    router.push(`/players/${player.id}/edit`)
  }

  const handleDelete = (playerId: number) => {
    setDeletingPlayerId(playerId)
  }

  const confirmDelete = async () => {
    if (!deletingPlayerId) return
    await deletePlayerMutation.mutateAsync(deletingPlayerId.toString())
    setDeletingPlayerId(null)
  }

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />
    }
    
    if (error) {
      return <ErrorDisplay error={error} onRetry={refetch} />
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
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg p-1">
            <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                disabled={isLoading || deletePlayerMutation.isPending}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                disabled={isLoading || deletePlayerMutation.isPending}
            >
                <Grid className="h-4 w-4" />
            </Button>
            </div>
        </div>
        {renderContent()}
        <ConfirmDialog
            open={deletingPlayerId !== null}
            onOpenChange={(open) => !open && setDeletingPlayerId(null)}
            title="Delete Player"
            description="Are you sure you want to delete this player? This action cannot be undone."
            onConfirm={confirmDelete}
            variant="destructive"
        />
    </div>
  )
}
