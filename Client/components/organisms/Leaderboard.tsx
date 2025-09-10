"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LeaderboardRow } from "@/components/molecules/LeaderboardRow"
import type { TournamentRankingDTO } from "@/types"
import { Trophy, Medal, Award, RefreshCw } from "lucide-react"

interface LeaderboardProps {
  rankings: TournamentRankingDTO[]
  tournamentName?: string
  isLive?: boolean
}

export function Leaderboard({ rankings, tournamentName, isLive = false }: LeaderboardProps) {
  const [sortBy, setSortBy] = useState<"gross" | "net">("gross")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const sortedRankings = [...rankings].sort((a, b) => {
    const scoreA = sortBy === "net" && a.netScore !== undefined ? a.netScore : a.totalScore
    const scoreB = sortBy === "net" && b.netScore !== undefined ? b.netScore : b.totalScore
    return scoreA - scoreB
  })

  const getLeaderStats = () => {
    if (rankings.length === 0) return null

    const leader = sortedRankings[0]
    const leaderScore = sortBy === "net" && leader.netScore !== undefined ? leader.netScore : leader.totalScore

    return {
      leader: leader.playerName,
      score: leaderScore,
      totalPlayers: rankings.length,
    }
  }

  const stats = getLeaderStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {tournamentName ? `${tournamentName} Leaderboard` : "Tournament Leaderboard"}
                {isLive && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">LIVE</span>}
              </CardTitle>
              {stats && (
                <p className="text-muted-foreground mt-1">
                  {stats.leader} leads at {stats.score > 0 ? "+" : ""}
                  {stats.score === 0 ? "E" : stats.score} • {stats.totalPlayers} players
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: "gross" | "net") => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gross">Gross Score</SelectItem>
                  <SelectItem value="net">Net Score</SelectItem>
                </SelectContent>
              </Select>

              {isLive && (
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardContent className="p-0">
          {sortedRankings.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No scores yet</h3>
              <p className="text-muted-foreground">
                Scores will appear here once players start submitting their rounds
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {sortedRankings.map((ranking, index) => (
                <LeaderboardRow
                  key={ranking.playerId}
                  ranking={{ ...ranking, position: index + 1 }}
                  showNetScore={sortBy === "net"}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Medal className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Leader</p>
                  <p className="font-bold">{sortedRankings[0]?.playerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {sortBy === "net" && sortedRankings[0]?.netScore !== undefined
                      ? sortedRankings[0].netScore > 0
                        ? `+${sortedRankings[0].netScore}`
                        : sortedRankings[0].netScore === 0
                          ? "E"
                          : sortedRankings[0].netScore
                      : sortedRankings[0]?.totalScore > 0
                        ? `+${sortedRankings[0].totalScore}`
                        : sortedRankings[0]?.totalScore === 0
                          ? "E"
                          : sortedRankings[0]?.totalScore}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Players</p>
                  <p className="font-bold">{rankings.length}</p>
                  <p className="text-sm text-muted-foreground">Competing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Cut Line</p>
                  <p className="font-bold">
                    {rankings.length > 10 ? `T${Math.ceil(rankings.length * 0.7)}` : "All Make Cut"}
                  </p>
                  <p className="text-sm text-muted-foreground">{rankings.length > 10 ? "70% advance" : "No cut"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
