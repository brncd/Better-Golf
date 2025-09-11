"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { PlayerTable } from "@/components/organisms/PlayerTable"
import { PlayerCard } from "@/components/molecules/PlayerCard"
import { playerService } from "@/lib/services"
import { PlayerListGetDTO, PaginationResponse } from "@/types"
import { Plus, Grid, List, Users } from "lucide-react"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { useToast } from "@/hooks/use-toast"

export default function PlayersPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [players, setPlayers] = useState<PlayerListGetDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null)
  const { handleError, clearError } = useErrorHandler({ context: 'PlayersPage' })
  const { toast } = useToast()

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setIsLoading(true)
        const response = await playerService.getAll({ pageNumber: 1, pageSize: 10 })
        setPlayers(response.items)
      } catch (err) {
        handleError(err, 'Failed to fetch players')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const handleEdit = (id: number) => {
    router.push(`/players/${id}/edit`)
  }

  const handleDelete = (id: number) => {
    setDeletingPlayerId(id)
  }

  const confirmDelete = async () => {
    if (!deletingPlayerId) return
    
    try {
      setIsLoading(true)
      await playerService.delete(deletingPlayerId.toString())
      // Refresh the players list
      const response = await playerService.getAll({ pageNumber: 1, pageSize: 10 })
      setPlayers(response.items)
      setDeletingPlayerId(null)
      toast({
        title: "Success",
        description: "Player deleted successfully",
      })
    } catch (err) {
      handleError(err, 'Failed to delete player')
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    // Error handling is now managed by useErrorHandler hook

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
        {players.map((player) => (
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

