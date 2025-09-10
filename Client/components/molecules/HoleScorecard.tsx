"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ParBadge } from "@/components/atoms/ParBadge"
import { ScoreBadge } from "@/components/atoms/ScoreBadge"
import type { HoleListGetDTO } from "@/types"
import { Minus, Plus } from "lucide-react"

interface HoleScorecardProps {
  hole: HoleListGetDTO
  initialScore?: number
  onScoreChange: (holeId: string, score: number) => void
  disabled?: boolean
}

export function HoleScorecard({ hole, initialScore, onScoreChange, disabled }: HoleScorecardProps) {
  const [score, setScore] = useState(initialScore || hole.par)

  const updateScore = (newScore: number) => {
    const validScore = Math.max(1, Math.min(15, newScore)) // Limit between 1 and 15
    setScore(validScore)
    onScoreChange(hole.id, validScore)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Hole {hole.holeNumber}</CardTitle>
          <ParBadge par={hole.par} />
        </div>
        <div className="text-sm text-muted-foreground">
          {hole.yardage} yards • Handicap {hole.handicap}
        </div>
        {hole.description && <div className="text-sm text-muted-foreground italic">{hole.description}</div>}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => updateScore(score - 1)} disabled={disabled || score <= 1}>
            <Minus className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center gap-2">
            <Input
              type="number"
              value={score}
              onChange={(e) => updateScore(Number.parseInt(e.target.value) || hole.par)}
              className="w-20 text-center text-lg font-bold"
              min="1"
              max="15"
              disabled={disabled}
            />
            <ScoreBadge score={score} par={hole.par} />
          </div>

          <Button variant="outline" size="sm" onClick={() => updateScore(score + 1)} disabled={disabled || score >= 15}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Strokes: {score} | Par: {hole.par} | Score: {score - hole.par > 0 ? "+" : ""}
          {score - hole.par === 0 ? "E" : score - hole.par}
        </div>
      </CardContent>
    </Card>
  )
}
