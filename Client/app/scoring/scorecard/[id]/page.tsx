"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { scoringService, ScorecardWithResults } from "@/lib/services/scoringService"
import { courseService } from "@/lib/services"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { CourseDetailGetDTO } from "@/types"
import { ArrowLeft, Edit, Flag, Target, Trophy, Lock } from "lucide-react"

export default function ViewScorecardPage() {
  const params = useParams()
  const scorecardId = params.id as string
  
  const [scorecard, setScorecard] = useState<ScorecardWithResults | null>(null)
  const [course, setCourse] = useState<CourseDetailGetDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { handleError } = useErrorHandler({ context: 'ViewScorecardPage' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const scorecardData = await scoringService.getScorecardWithResults(scorecardId)
        setScorecard(scorecardData)
        
        if (scorecardData.courseId) {
          const courseData = await courseService.getById(scorecardData.courseId.toString())
          setCourse(courseData)
        }
      } catch (err) {
        handleError(err, 'Failed to load scorecard data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [scorecardId, handleError])

  const getScoreForHole = (holeId: number) => {
    return scorecard?.results.find(result => result.holeId === holeId)?.strokes || 0
  }

  const calculateTotal = () => {
    if (!scorecard) return 0
    return scorecard.results.reduce((sum, result) => sum + result.strokes, 0)
  }

  const calculatePar = () => {
    if (!course) return 0
    return course.holes.reduce((sum, hole) => sum + hole.par, 0)
  }

  const calculateScore = () => {
    const total = calculateTotal()
    const par = calculatePar()
    return total - par
  }

  const getScoreBadgeVariant = (scoreToPar: number) => {
    if (scoreToPar < 0) return "default" // Under par (birdie, eagle, etc.)
    if (scoreToPar === 0) return "secondary" // Par
    return "destructive" // Over par (bogey, double bogey, etc.)
  }

  const getScoreDescription = (scoreToPar: number) => {
    if (scoreToPar === -2) return "Eagle"
    if (scoreToPar === -1) return "Birdie"
    if (scoreToPar === 0) return "Par"
    if (scoreToPar === 1) return "Bogey"
    if (scoreToPar === 2) return "Double Bogey"
    if (scoreToPar > 2) return `+${scoreToPar}`
    if (scoreToPar < -2) return `${scoreToPar}`
    return ""
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

  if (!scorecard || !course) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Scorecard Not Found</h1>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/scoring">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Scoring
                </Link>
              </Button>
            </div>
            {!scorecard.isLocked && (
              <Button asChild>
                <Link href={`/scoring/scorecard/${scorecardId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Scores
                </Link>
              </Button>
            )}
          </div>

          {/* Scorecard Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    {scorecard.playerName}
                    {scorecard.isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                  </h1>
                  <p className="text-muted-foreground">Round {scorecard.roundNumber} • {course.name}</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    calculateScore() < 0 ? 'text-green-600' : 
                    calculateScore() === 0 ? 'text-blue-600' : 
                    'text-red-600'
                  }`}>
                    {calculateScore() > 0 ? `+${calculateScore()}` : calculateScore()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {calculateTotal()} strokes • {calculatePar()} par
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Scorecard Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Scorecard Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {course.holes
                  .sort((a, b) => a.holeNumber - b.holeNumber)
                  .map((hole) => {
                    const strokes = getScoreForHole(hole.id)
                    const scoreToPar = strokes - hole.par
                    
                    return (
                      <div key={hole.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold">
                            {hole.holeNumber}
                          </div>
                          <div>
                            <div className="font-semibold">Hole {hole.holeNumber}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Flag className="h-3 w-3" />
                              Par {hole.par} • {hole.distance}m
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold">{strokes || "-"}</div>
                            {strokes > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {getScoreDescription(scoreToPar)}
                              </div>
                            )}
                          </div>
                          {strokes > 0 && (
                            <Badge variant={getScoreBadgeVariant(scoreToPar)}>
                              {scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Round Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{calculateTotal()}</div>
                  <div className="text-sm text-muted-foreground">Total Strokes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{calculatePar()}</div>
                  <div className="text-sm text-muted-foreground">Course Par</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    calculateScore() < 0 ? 'text-green-600' : 
                    calculateScore() === 0 ? 'text-blue-600' : 
                    'text-red-600'
                  }`}>
                    {calculateScore() > 0 ? `+${calculateScore()}` : calculateScore()}
                  </div>
                  <div className="text-sm text-muted-foreground">Score to Par</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {scorecard.isLocked ? "Final" : "In Progress"}
                  </div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
