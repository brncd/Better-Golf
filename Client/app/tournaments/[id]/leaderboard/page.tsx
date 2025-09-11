"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaderboard } from "@/components/organisms/Leaderboard"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { tournamentService } from "@/lib/services"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { useToast } from "@/hooks/use-toast"
import { SingleTournamentDTO, TournamentRankingDTO } from "@/types"
import { ArrowLeft, Target, RefreshCw, Play, Pause } from "lucide-react"

export default function TournamentLeaderboardPage() {
  const params = useParams()
  const tournamentId = params.id as string

  const [tournament, setTournament] = useState<SingleTournamentDTO | null>(null)
  const [rankings, setRankings] = useState<TournamentRankingDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const { handleError } = useErrorHandler({ context: 'TournamentLeaderboardPage' })
  const { toast } = useToast()

  const fetchLeaderboardData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const [tournamentData, rankingsData] = await Promise.all([
        tournamentService.getById(tournamentId),
        tournamentService.calculateResults(tournamentId)
      ])

      setTournament(tournamentData)
      setRankings(rankingsData)
      setLastUpdated(new Date())

      if (showRefreshIndicator) {
        toast({
          title: "Leaderboard updated",
          description: "Latest results have been loaded",
        })
      }
    } catch (err) {
      handleError(err, 'Failed to load leaderboard data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [tournamentId, handleError, toast])

  useEffect(() => {
    fetchLeaderboardData()
  }, [fetchLeaderboardData])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchLeaderboardData(true)
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, fetchLeaderboardData])

  const handleManualRefresh = () => {
    fetchLeaderboardData(true)
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
    toast({
      title: autoRefresh ? "Auto-refresh disabled" : "Auto-refresh enabled",
      description: autoRefresh 
        ? "Leaderboard will no longer update automatically" 
        : "Leaderboard will update every 30 seconds",
    })
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
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/tournaments/${tournament.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tournament
            </Link>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Live Leaderboard</h1>
            <p className="text-muted-foreground">{tournament.name}</p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Refresh'}
            </Button>
            
            <Button
              variant="outline"
              onClick={toggleAutoRefresh}
            >
              {autoRefresh ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Auto-refresh On
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Auto-refresh Off
                </>
              )}
            </Button>

            <Button asChild>
              <Link href={`/scoring/tournament/${tournament.id}`}>
                <Target className="h-4 w-4 mr-2" />
                Enter Scores
              </Link>
            </Button>
          </div>
        </div>

        {/* Auto-refresh status */}
        {autoRefresh && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Auto-refresh enabled - Updates every 30 seconds
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Leaderboard 
          rankings={rankings} 
          tournamentName={tournament.name} 
          isLive={tournament.tournamentType === "InProgress"} 
        />
      </div>
    </MainLayout>
  )
}
