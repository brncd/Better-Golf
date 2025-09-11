"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"
import { scoringService, ScorecardWithResults } from "@/lib/services/scoringService"
import { courseService } from "@/lib/services"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { useToast } from "@/hooks/use-toast"
import { CourseDetailGetDTO, HoleDTO } from "@/types"
import { ArrowLeft, Save, Lock, Target, Flag, Minus, Plus } from "lucide-react"

export default function EditScorecardPage() {
  const params = useParams()
  const router = useRouter()
  const scorecardId = params.id as string
  
  const [scorecard, setScorecard] = useState<ScorecardWithResults | null>(null)
  const [course, setCourse] = useState<CourseDetailGetDTO | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showLockDialog, setShowLockDialog] = useState(false)
  
  const { handleError } = useErrorHandler({ context: 'EditScorecardPage' })
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const scorecardData = await scoringService.getScorecardWithResults(scorecardId)
        setScorecard(scorecardData)
        
        if (scorecardData.courseId) {
          const courseData = await courseService.getByIdWithHoles(scorecardData.courseId.toString())
          setCourse(courseData)
          
          // Initialize scores from existing results
          const initialScores: Record<string, number> = {}
          scorecardData.results.forEach(result => {
            initialScores[result.holeId.toString()] = result.strokes
          })
          setScores(initialScores)
        }
      } catch (err) {
        handleError(err, 'Failed to load scorecard data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [scorecardId, handleError])

  const updateScore = (holeId: string, strokes: number) => {
    if (strokes < 1 || strokes > 15) return // Reasonable limits
    setScores(prev => ({ ...prev, [holeId]: strokes }))
  }

  const saveScore = async (holeId: string, strokes: number) => {
    try {
      await scoringService.updateScorecardResult(
        scorecardId, 
        holeId, 
        strokes, 
        scorecard?.roundNumber || 1
      )
      toast({
        title: "Score saved",
        description: `Hole ${course?.holes.find(h => h.id.toString() === holeId)?.holeNumber}: ${strokes} strokes`,
      })
    } catch (err) {
      handleError(err, 'Failed to save score')
    }
  }

  const saveAllScores = async () => {
    if (!course) return
    
    try {
      setIsSaving(true)
      const savePromises = Object.entries(scores).map(([holeId, strokes]) =>
        scoringService.updateScorecardResult(
          scorecardId,
          holeId,
          strokes,
          scorecard?.roundNumber || 1
        )
      )
      
      await Promise.all(savePromises)
      toast({
        title: "Success",
        description: "All scores saved successfully",
      })
    } catch (err) {
      handleError(err, 'Failed to save scores')
    } finally {
      setIsSaving(false)
    }
  }

  const lockScorecard = async () => {
    try {
      await scoringService.lockScorecard(scorecardId)
      toast({
        title: "Scorecard locked",
        description: "Scorecard has been locked and can no longer be edited",
      })
      router.back()
    } catch (err) {
      handleError(err, 'Failed to lock scorecard')
    }
  }

  const calculateTotal = () => {
    return Object.values(scores).reduce((sum, score) => sum + (score || 0), 0)
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

  if (scorecard.isLocked) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Scorecard Locked</h1>
          <p className="text-muted-foreground mb-4">This scorecard has been locked and can no longer be edited.</p>
          <Button asChild>
            <Link href={`/scoring/scorecard/${scorecardId}`}>View Scorecard</Link>
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
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={saveAllScores} 
                disabled={isSaving}
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save All"}
              </Button>
              <Button 
                onClick={() => setShowLockDialog(true)}
                variant="destructive"
              >
                <Lock className="h-4 w-4 mr-2" />
                Lock Scorecard
              </Button>
            </div>
          </div>

          {/* Scorecard Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{scorecard.playerName}</h1>
                  <p className="text-muted-foreground">Round {scorecard.roundNumber} • {course.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {calculateScore() > 0 ? `+${calculateScore()}` : calculateScore()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {calculateTotal()} / {calculatePar()} par
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Scoring Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Hole-by-Hole Scoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {course.holes
                  .sort((a, b) => a.holeNumber - b.holeNumber)
                  .map((hole) => {
                    const currentScore = scores[hole.id.toString()] || 0
                    const scoreToPar = currentScore - hole.par
                    
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
                          {currentScore > 0 && (
                            <Badge 
                              variant={
                                scoreToPar < 0 ? "default" : 
                                scoreToPar === 0 ? "secondary" : 
                                "destructive"
                              }
                            >
                              {scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar}
                            </Badge>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateScore(hole.id.toString(), Math.max(1, currentScore - 1))}
                              disabled={currentScore <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <Input
                              type="number"
                              min="1"
                              max="15"
                              value={currentScore || ""}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0
                                updateScore(hole.id.toString(), value)
                              }}
                              onBlur={() => {
                                if (currentScore > 0) {
                                  saveScore(hole.id.toString(), currentScore)
                                }
                              }}
                              className="w-16 text-center"
                              placeholder="0"
                            />
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateScore(hole.id.toString(), Math.min(15, currentScore + 1))}
                              disabled={currentScore >= 15}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
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
              </div>
            </CardContent>
          </Card>
        </div>

        <ConfirmDialog
          open={showLockDialog}
          onOpenChange={setShowLockDialog}
          title="Lock Scorecard"
          description="Are you sure you want to lock this scorecard? Once locked, it cannot be edited anymore."
          onConfirm={lockScorecard}
        />
      </MainLayout>
    </ProtectedRoute>
  )
}
