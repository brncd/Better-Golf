"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Scorecard } from "@/components/organisms/Scorecard"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { tournamentService, courseService } from "@/lib/services"
import { SingleTournamentDTO, SingleCourseDTO } from "@/types"
import { ArrowLeft, Trophy } from "lucide-react"

export default function TournamentScoringPage() {
  const params = useParams()
  const tournamentId = params.id as string
  const [tournament, setTournament] = useState<SingleTournamentDTO | null>(null)
  const [course, setCourse] = useState<SingleCourseDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const tournamentData = await tournamentService.getById(tournamentId)
        setTournament(tournamentData)
        
        const courseData = await courseService.getById(tournamentData.courseId)
        setCourse(courseData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tournament data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [tournamentId])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (error || !tournament || !course) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Error Loading Tournament</h1>
          <p className="text-muted-foreground mb-4">{error || "Tournament not found"}</p>
          <Button asChild>
            <Link href="/scoring">Back to Scoring</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <ProtectedRoute requiredRole="Player">
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/scoring">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scoring
              </Link>
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-balance">{tournament.name}</h1>
              <p className="text-muted-foreground">
                {course.name} • {course.location}
              </p>
            </div>

            <Button asChild>
              <Link href={`/tournaments/${tournament.id}`}>
                <Trophy className="h-4 w-4 mr-2" />
                View Tournament
              </Link>
            </Button>
          </div>

          {/* Scorecard */}
          <Scorecard tournamentId={tournament.id} courseId={tournament.courseId} roundNumber={1} />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
