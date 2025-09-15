"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HoleScorecard } from "@/components/molecules/HoleScorecard"
import { useCourseHoles } from "@/hooks/useCourses"
import { usePlayers } from "@/hooks/usePlayers"
import { useScorecard, useCreateScorecard, useUpdateScorecard, useUpdateHoleScore } from "@/hooks/useScorecards"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ErrorDisplay } from "@/components/atoms/ErrorDisplay"
import { useToast } from "@/hooks/use-toast"
import { Save, RotateCcw } from "lucide-react"
import type { ScorecardPostDTO, ScorecardResultPostDTO } from "@/types"

interface ScorecardProps {
  tournamentId: number
  courseId: number
  roundNumber?: number
  existingScorecardId?: number // For editing existing scorecard
}

export function Scorecard({ tournamentId, courseId, roundNumber = 1, existingScorecardId }: ScorecardProps) {
  const { toast } = useToast()
  const { data: holesResponse, isLoading: holesLoading, error: holesError } = useCourseHoles(courseId)
  const { data: playersResponse, isLoading: playersLoading, error: playersError } = usePlayers()
  const { data: existingScorecard, isLoading: scorecardLoading } = useScorecard(existingScorecardId || 0)
  
  const createScorecardMutation = useCreateScorecard()
  const updateScorecardMutation = useUpdateScorecard()
  const updateHoleScoreMutation = useUpdateHoleScore()
  
  const holes = (holesResponse as any)?.items || []
  const players = (playersResponse as any)?.items || []

  const [selectedPlayer, setSelectedPlayer] = useState<string>("")
  const [scores, setScores] = useState<Record<number, number>>({})
  const [playingHandicap, setPlayingHandicap] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Load existing scorecard data if editing
  useEffect(() => {
    if (existingScorecard) {
      setSelectedPlayer(existingScorecard.playerId.toString())
      setPlayingHandicap(existingScorecard.playingHandicap)
      
      // Convert scorecard results to scores map
      const scoresMap: Record<number, number> = {}
      existingScorecard.scorecardResults.forEach(result => {
        // Find hole by hole number to get hole ID
        const hole = holes.find((h: any) => h.holeNumber === result.holeNumber)
        if (hole) {
          scoresMap[hole.id] = result.strokes
        }
      })
      setScores(scoresMap)
    }
  }, [existingScorecard, holes])

  // Update playing handicap when player changes
  useEffect(() => {
    if (selectedPlayer) {
      const player = players.find((p: any) => p.id.toString() === selectedPlayer)
      if (player) {
        setPlayingHandicap(player.handicap || 0)
      }
    }
  }, [selectedPlayer, players])

  const handleScoreChange = async (holeId: number, score: number) => {
    setScores((prev) => ({ ...prev, [holeId]: score }))
    
    // If editing existing scorecard, update individual hole score immediately
    if (existingScorecardId) {
      try {
        await updateHoleScoreMutation.mutateAsync({
          scorecardId: existingScorecardId,
          holeId,
          strokes: score,
          roundNumber
        })
      } catch (error) {
        toast({
          title: "Error updating score",
          description: "Failed to save score for this hole. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleSubmit = async () => {
    if (!selectedPlayer) {
      toast({
        title: "Player required",
        description: "Please select a player before submitting scores.",
        variant: "destructive",
      })
      return
    }

    if (Object.keys(scores).length === 0) {
      toast({
        title: "No scores entered",
        description: "Please enter at least one score before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Convert scores to scorecard results format
      const scorecardResults: ScorecardResultPostDTO[] = Object.entries(scores).map(([holeId, strokes]) => ({
        holeId: parseInt(holeId),
        strokes,
        roundNumber
      }))

      const scorecardData: ScorecardPostDTO = {
        playerId: parseInt(selectedPlayer),
        tournamentId,
        playingHandicap,
        scorecardResults
      }

      if (existingScorecardId) {
        // Update existing scorecard
        await updateScorecardMutation.mutateAsync({
          scorecardId: existingScorecardId,
          scorecard: scorecardData
        })
        toast({
          title: "Scorecard updated",
          description: "Scores have been successfully updated.",
        })
      } else {
        // Create new scorecard
        await createScorecardMutation.mutateAsync(scorecardData)
        toast({
          title: "Scorecard created",
          description: "Scores have been successfully submitted.",
        })
        // Reset form for new entry
        setScores({})
        setSelectedPlayer("")
      }
    } catch (error) {
      // Error handling is done by the mutation hooks
      console.error("Error submitting scorecard:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setScores({})
  }

  const getTotalScore = () => {
    const totalStrokes = Object.values(scores).reduce((sum: number, score: number) => sum + score, 0)
    const totalPar = holes.reduce((sum: number, hole: any) => sum + hole.par, 0)
    return totalStrokes - totalPar
  }

  const getCompletedHoles = () => {
    return Object.keys(scores).length
  }

  if (holesLoading || playersLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (holesError) {
    return <ErrorDisplay error={holesError} onRetry={() => window.location.reload()} />
  }

  if (playersError) {
    return <ErrorDisplay error={playersError} onRetry={() => window.location.reload()} />
  }

  if (holes.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">No holes found</p>
          <p>This course doesn't have any holes configured yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Round {roundNumber} Scorecard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Select Player</label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player: any) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.firstName} {player.lastName} (Handicap: {player.handicap})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={!selectedPlayer}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSubmit} disabled={!selectedPlayer || getCompletedHoles() === 0 || isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Round"}
              </Button>
            </div>
          </div>

          {selectedPlayer && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>
                  Holes Completed: {getCompletedHoles()}/{holes.length}
                </span>
                <span>
                  Current Score: {getTotalScore() > 0 ? "+" : ""}
                  {getTotalScore() === 0 ? "E" : getTotalScore()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holes Grid */}
      {selectedPlayer && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {holes.map((hole: any) => (
            <HoleScorecard
              key={hole.id}
              hole={hole}
              initialScore={scores[hole.id]}
              onScoreChange={handleScoreChange}
              disabled={!selectedPlayer}
            />
          ))}
        </div>
      )}

      {!selectedPlayer && (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium mb-2">Select a player to start scoring</p>
            <p>Choose a player from the dropdown above to begin entering scores for this round.</p>
          </div>
        </div>
      )}
    </div>
  )
}
