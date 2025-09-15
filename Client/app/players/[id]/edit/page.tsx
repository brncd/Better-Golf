"use client"

import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { PlayerForm } from "@/components/organisms/PlayerForm"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePlayer, useUpdatePlayer } from "@/hooks/usePlayers"
import type { PlayerPostDTO, SinglePlayerDTO } from "@/types"

interface EditPlayerPageProps {
  params: { id: string }
}

export default function EditPlayerPage({ params }: EditPlayerPageProps) {
  const router = useRouter()
  const playerId = parseInt(params.id)
  
  // Use TanStack Query to fetch player data
  const { data: playerData, isLoading, error } = usePlayer(params.id)
  const updatePlayerMutation = useUpdatePlayer()

  // Convert SinglePlayerDTO to PlayerPostDTO for form
  const player: PlayerPostDTO | null = playerData ? {
    firstName: (playerData as SinglePlayerDTO).firstName,
    lastName: (playerData as SinglePlayerDTO).lastName,
    email: (playerData as SinglePlayerDTO).email,
    handicap: (playerData as SinglePlayerDTO).handicap,
    gender: (playerData as SinglePlayerDTO).gender,
    dateOfBirth: (playerData as SinglePlayerDTO).dateOfBirth,
    phoneNumber: (playerData as SinglePlayerDTO).phoneNumber,
    membershipNumber: (playerData as SinglePlayerDTO).membershipNumber,
  } : null

  const handleSubmit = async (data: PlayerPostDTO) => {
    try {
      await updatePlayerMutation.mutateAsync({
        id: params.id,
        player: data
      })
      router.push(`/players/${params.id}`)
    } catch (error) {
      console.error("Error updating player:", error)
      // Error handling is done in the PlayerForm component
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-red-500">
          <h1 className="text-2xl font-bold mb-4">Error Loading Player</h1>
          <p className="mb-4">{error instanceof Error ? error.message : 'Failed to load player'}</p>
          <Button asChild>
            <Link href="/players">Back to Players</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  if (!player) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Player Not Found</h1>
          <Button asChild>
            <Link href="/players">Back to Players</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/players/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Player</h1>
            <p className="text-muted-foreground">Update player information and details</p>
          </div>
        </div>

        <PlayerForm initialData={player} onSubmit={handleSubmit} onCancel={() => router.push(`/players/${params.id}`)} />
      </div>
    </MainLayout>
  )
}
