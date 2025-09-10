"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { PlayerForm } from "@/components/organisms/PlayerForm"
import type { PlayerPostDTO } from "@/types"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewPlayerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: PlayerPostDTO) => {
    setIsLoading(true)
    try {
      // In real app, this would call API to create player
      console.log("Creating player:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Navigate back to players list
      router.push("/players")
    } catch (error) {
      console.error("Error creating player:", error)
    } finally {
      setIsLoading(false)
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
          <h1 className="text-3xl font-bold text-balance">Register New Player</h1>
          <p className="text-muted-foreground">Add a new player to the golf club system</p>
        </div>

        {/* Form */}
        <PlayerForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </div>
    </MainLayout>
  )
}
