"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"
import { useScorecard, useUpdateHoleScore, useLockScorecard } from "@/hooks/useScorecardService"
import { useCourse } from "@/hooks/useCourses"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Lock, Target, Flag, Minus, Plus } from "lucide-react"

export default function EditScorecardPage() {
  const params = useParams()
  const router = useRouter()
  const scorecardId = parseInt(params.id as string, 10)
  
  const { data: scorecard, isLoading: scorecardLoading, isError: scorecardIsError } = useScorecard(scorecardId)
  const { data: course, isLoading: courseLoading, isError: courseIsError } = useCourse(scorecard?.courseId)
  const updateHoleScore = useUpdateHoleScore()
  const lockScorecardMutation = useLockScorecard()

  const [scores, setScores] = useState<Record<string, number>>({})
  const [showLockDialog, setShowLockDialog] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    if (scorecard) {
      const initialScores: Record<string, number> = {}
      scorecard.results.forEach(result => {
        initialScores[result.holeId.toString()] = result.strokes
      })
      setScores(initialScores)
    }
  }, [scorecard])

  const handleScoreChange = (holeId: string, strokes: number) => {
    if (strokes < 1 || strokes > 15) return
    setScores(prev => ({ ...prev, [holeId]: strokes }))
  }

  const handleSaveScore = (holeId: string, strokes: number) => {
    updateHoleScore.mutate({ scorecardId, holeId: parseInt(holeId, 10), strokes }, {
      onSuccess: () => {
        toast({
          title: "Score Saved",
          description: `Hole ${course?.holes.find(h => h.id.toString() === holeId)?.holeNumber}: ${strokes} strokes`,
        })
      }
    })
  }

  const handleSaveAllScores = () => {
    const promises = Object.entries(scores).map(([holeId, strokes]) => 
      updateHoleScore.mutateAsync({ scorecardId, holeId: parseInt(holeId, 10), strokes })
    )
    Promise.all(promises).then(() => {
      toast({
        title: "All Scores Saved",
        description: "All scores have been successfully saved.",
      })
    })
  }

  const handleLockScorecard = () => {
    lockScorecardMutation.mutate(scorecardId, {
      onSuccess: () => {
        toast({
          title: "Scorecard Locked",
          description: "The scorecard has been locked and can no longer be edited.",
        })
        router.push(`/scoring/scorecard/${scorecardId}`)
      }
    })
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

  const isLoading = scorecardLoading || courseLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (scorecardIsError || courseIsError || !scorecard || !course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Scorecard Not Found</h1>
        <Button asChild>
          <Link href="/scoring">Back to Scoring</Link>
        </Button>
      </div>
    )
  }

  if (scorecard.isLocked) {
    return (
      <div className="text-center py-12">
        <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-4">Scorecard Locked</h1>
        <p className="text-muted-foreground mb-4">This scorecard has been locked and can no longer be edited.</p>
        <Button asChild>
          <Link href={`/scoring/scorecard/${scorecardId}`}>View Scorecard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/scoring/scorecard/${scorecardId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveAllScores} 
            disabled={updateHoleScore.isPending}
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateHoleScore.isPending ? "Saving..." : "Save All"}
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
                          onClick={() => handleScoreChange(hole.id.toString(), Math.max(1, currentScore - 1))}
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
                            handleScoreChange(hole.id.toString(), value)
                          }}
                          onBlur={() => {
                            if (currentScore > 0) {
                              handleSaveScore(hole.id.toString(), currentScore)
                            }
                          }}
                          className="w-16 text-center"
                          placeholder="0"
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleScoreChange(hole.id.toString(), Math.min(15, currentScore + 1))}
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

      <ConfirmDialog
        open={showLockDialog}
        onOpenChange={setShowLockDialog}
        title="Lock Scorecard"
        description="Are you sure you want to lock this scorecard? Once locked, it cannot be edited anymore."
        onConfirm={handleLockScorecard}
      />
    </div>
  )
}