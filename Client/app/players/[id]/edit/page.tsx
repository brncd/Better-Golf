"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { PlayerForm } from "@/components/organisms/PlayerForm"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { mockPlayers } from "@/data/mockData"
import type { PlayerCreateDTO } from "@/types"

interface EditPlayerPageProps {
  params: { id: string }
}

export default function EditPlayerPage({ params }: EditPlayerPageProps) {
  const router = useRouter()
  const [player, setPlayer] = useState<PlayerCreateDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const foundPlayer = mockPlayers.find((p) => p.id === params.id)
    if (foundPlayer) {
      setPlayer({
        firstName: foundPlayer.firstName,
        lastName: foundPlayer.lastName,
        email: foundPlayer.email,
        phoneNumber: foundPlayer.phoneNumber,
        dateOfBirth: foundPlayer.dateOfBirth,
        gender: foundPlayer.gender,
        handicap: foundPlayer.handicap,
        membershipNumber: foundPlayer.membershipNumber,
        categoryId: foundPlayer.categoryId,
      })
    }
    setIsLoading(false)
  }, [params.id])

  const handleSubmit = async (data: PlayerCreateDTO) => {
    console.log("[v0] Updating player:", data)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push(`/players/${params.id}`)
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

        <PlayerForm initialData={player} onSubmit={handleSubmit} submitLabel="Update Player" />
      </div>
    </MainLayout>
  )
}
