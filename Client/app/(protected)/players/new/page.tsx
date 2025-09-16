"use client"

import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { PlayerForm } from "@/components/organisms/PlayerForm"
import { useCreatePlayer } from "@/hooks/usePlayers"
import type { PlayerPostDTO } from "@/types"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewPlayerPage() {
  const router = useRouter()
  const createPlayerMutation = useCreatePlayer()

  const handleSubmit = async (data: PlayerPostDTO) => {
    try {
      await createPlayerMutation.mutateAsync(data)
      router.push("/players")
    } catch (error) {
      console.error("Error creating player:", error)
      // Error handling is done in the mutation hook
    }
  }

  const handleCancel = () => {
    router.push("/players")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/players">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Players
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-balance">Add New Player</h1>
          <p className="text-muted-foreground">Register a new player in the system</p>
        </div>

        {/* Form */}
        <PlayerForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={createPlayerMutation.isPending} />
      </div>
    </MainLayout>
  )
}