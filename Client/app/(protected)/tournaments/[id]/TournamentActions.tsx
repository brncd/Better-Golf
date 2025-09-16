"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useRegisterForTournament, useUnregisterFromTournament } from "@/hooks/useTournaments"
import { PlayerListGetDTO, SingleTournamentDTO } from "@/types"
import { UserPlus, UserMinus } from "lucide-react"
import { useState } from "react"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"

interface TournamentActionsProps {
  tournament: SingleTournamentDTO
  players: PlayerListGetDTO[]
}

export function TournamentActions({ tournament, players }: TournamentActionsProps) {
  const { user, hasRole } = useAuth()
  const [showUnregisterDialog, setShowUnregisterDialog] = useState(false)

  const registerMutation = useRegisterForTournament()
  const unregisterMutation = useUnregisterFromTournament()

  const isRegistered = user && players.some((player) => player.email === user.email)

  const handleRegister = () => {
    if (!user) return
    registerMutation.mutate(tournament.id)
  }

  const handleUnregister = () => {
    if (!user) return
    setShowUnregisterDialog(true)
  }

  const confirmUnregister = () => {
    if (!user?.email) return

    const registeredPlayer = players.find((p) => p.email === user.email)

    if (registeredPlayer) {
      unregisterMutation.mutate({ tournamentId: tournament.id, playerId: registeredPlayer.id })
      setShowUnregisterDialog(false)
    } else {
      console.error("Could not find registered player to unregister.")
      setShowUnregisterDialog(false)
    }
  }

  const canRegister = () => {
    if (!tournament || !user || !hasRole("Player")) return false
    return tournament.status === "OpenRegistration" && !isRegistered
  }

  const canUnregister = () => {
    if (!tournament || !user || !hasRole("Player")) return false
    return tournament.status === "OpenRegistration" && isRegistered
  }

  return (
    <>
      {canRegister() && (
        <Button onClick={handleRegister} disabled={registerMutation.isPending}>
          <UserPlus className="h-4 w-4 mr-2" />
          {registerMutation.isPending ? "Registering..." : "Register"}
        </Button>
      )}
      {canUnregister() && (
        <Button variant="outline" onClick={handleUnregister} disabled={unregisterMutation.isPending}>
          <UserMinus className="h-4 w-4 mr-2" />
          Unregister
        </Button>
      )}
      <ConfirmDialog
        open={showUnregisterDialog}
        onOpenChange={setShowUnregisterDialog}
        title="Confirm Unregistration"
        description="Are you sure you want to unregister from this tournament? This action cannot be undone."
        confirmLabel="Unregister"
        cancelLabel="Cancel"
        onConfirm={confirmUnregister}
        variant="destructive"
      />
    </>
  )
}
