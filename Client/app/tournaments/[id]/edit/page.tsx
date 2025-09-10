"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { TournamentForm } from "@/components/organisms/TournamentForm"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { tournamentService } from "@/lib/services"
import type { TournamentPostDTO, SingleTournamentDTO } from "@/types"

interface EditTournamentPageProps {
  params: { id: string }
}

export default function EditTournamentPage({ params }: EditTournamentPageProps) {
  const router = useRouter()
  const [tournament, setTournament] = useState<SingleTournamentDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setIsLoading(true)
        const data = await tournamentService.getById(params.id)
        setTournament(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tournament")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTournament()
  }, [params.id])

  const handleSubmit = async (data: TournamentPostDTO) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await tournamentService.update(params.id, data)
      router.push(`/tournaments/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tournament")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/tournaments/${params.id}`)
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
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Error Loading Tournament</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/tournaments">Back to Tournaments</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  if (!tournament) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <Button asChild>
            <Link href="/tournaments">Back to Tournaments</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <ProtectedRoute requiredRole="TournamentOrganizer">
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tournaments/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Tournament</h1>
              <p className="text-muted-foreground">Update tournament details and settings</p>
            </div>
          </div>

          <TournamentForm 
            initialData={tournament} 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            isLoading={isSubmitting}
            error={error}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
