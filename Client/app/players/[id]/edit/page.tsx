"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { PlayerForm } from "@/components/organisms/PlayerForm"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { PLayerPostDTO, SinglePlayerDTO } from "@/types"

interface EditPlayerPageProps {
  params: { id: string }
}

export default function EditPlayerPage({ params }: EditPlayerPageProps) {
  const router = useRouter()
  const [player, setPlayer] = useState<PLayerPostDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setIsLoading(true)
        const { playerService } = await import("@/lib/services")
        const playerData = await playerService.getById(params.id)
        
        // Convert SinglePlayerDTO to PLayerPostDTO for form
        setPlayer({
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          email: playerData.email,
          handicap: playerData.handicap,
          gender: playerData.gender,
          dateOfBirth: playerData.dateOfBirth,
          phoneNumber: playerData.phoneNumber,
          membershipNumber: playerData.membershipNumber,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load player")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayer()
  }, [params.id])

  const handleSubmit = async (data: PLayerPostDTO) => {
    try {
      const { playerService } = await import("@/lib/services")
      await playerService.update(params.id, data)
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
          <p className="mb-4">{error}</p>
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
