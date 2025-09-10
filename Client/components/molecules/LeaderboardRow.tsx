"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PositionBadge } from "@/components/atoms/PositionBadge"
import type { TournamentRankingDTO } from "@/types"

interface LeaderboardRowProps {
  ranking: TournamentRankingDTO
  showNetScore?: boolean
}

export function LeaderboardRow({ ranking, showNetScore }: LeaderboardRowProps) {
  const getInitials = (name: string) => {
    const parts = name.split(" ")
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.substring(0, 2)
  }

  const formatScore = (score: number) => {
    if (score === 0) return "E"
    return score > 0 ? `+${score}` : `${score}`
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="shrink-0">
        <PositionBadge position={ranking.position} />
      </div>

      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
        <AvatarImage
          src={`/abstract-geometric-shapes.png?key=leaderboard&height=40&width=40&query=${ranking.playerName}`}
        />
        <AvatarFallback className="text-xs">{getInitials(ranking.playerName)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate text-sm sm:text-base" title={ranking.playerName}>
          {ranking.playerName}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">Handicap: {ranking.handicap}</div>
      </div>

      <div className="text-right shrink-0">
        <div className="font-bold text-base sm:text-lg">
          {formatScore(showNetScore && ranking.netScore !== undefined ? ranking.netScore : ranking.totalScore)}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">{ranking.totalStrokes} strokes</div>
      </div>

      <div className="hidden sm:flex gap-1 shrink-0">
        {ranking.roundScores.map((roundScore, index) => (
          <div key={index} className="text-center min-w-[2rem]">
            <div className="text-sm font-medium">{roundScore}</div>
            <div className="text-xs text-muted-foreground">R{index + 1}</div>
          </div>
        ))}
      </div>

      <div className="sm:hidden shrink-0">
        <div className="text-xs text-muted-foreground">{ranking.roundScores.length} rounds</div>
      </div>
    </div>
  )
}
