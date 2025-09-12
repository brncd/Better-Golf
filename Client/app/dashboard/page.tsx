"use client"

import { MainLayout } from "@/components/layouts/MainLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { StatCard } from "@/components/molecules/StatCard"
import { QuickActionCard } from "@/components/molecules/QuickActionCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ErrorDisplay } from "@/components/atoms/ErrorDisplay"
import { tournamentService, playerService, courseService } from "@/lib/services"
import { useDashboardStats, useRecentActivity } from "@/hooks/useDashboard"
import { useState, useEffect, useMemo } from "react"
import type { TournamentListGetDTO, PlayerListGetDTO, CoursesListGetDTO } from "@/types"
import { Trophy, Users, MapPin, Calendar, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [tournaments, setTournaments] = useState<TournamentListGetDTO[]>([])
  const [players, setPlayers] = useState<PlayerListGetDTO[]>([])
  const [courses, setCourses] = useState<CoursesListGetDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use new dashboard API endpoints
  const { data: dashboardStats, error: statsError, isLoading: statsLoading } = useDashboardStats()
  const { data: recentActivity, error: activityError, isLoading: activityLoading } = useRecentActivity(5)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [tournamentsData, playersData, coursesData] = await Promise.all([
          tournamentService.getAll({ pageNumber: 1, pageSize: 50 }),
          playerService.getAll({ pageNumber: 1, pageSize: 50 }),
          courseService.getAll({ pageNumber: 1, pageSize: 50 })
        ])
        
        setTournaments(tournamentsData.items)
        setPlayers(playersData.items)
        setCourses(coursesData.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate statistics from existing data (fallback)
  const calculatedStats = useMemo(() => {
    const today = new Date()
    const activeTournaments = tournaments.filter((t) => {
      const startDate = new Date(t.startDate)
      const endDate = new Date(t.endDate)
      return startDate <= today && endDate >= today
    })
    const upcomingTournaments = tournaments.filter((t) => {
      const startDate = new Date(t.startDate)
      return startDate > today
    })
    const totalPlayers = players.length
    const activePlayers = players.filter((p) => p.isActive).length
    const totalCourses = courses.length

    // Calculate growth trends (simplified - would be better with historical data)
    const monthlyTournamentGrowth = Math.floor(Math.random() * 15) + 5 // Mock for now
    const monthlyPlayerGrowth = Math.floor(Math.random() * 10) + 3 // Mock for now
    const playerParticipationRate = activePlayers > 0 ? Math.round((activePlayers / totalPlayers) * 100) : 0

    return {
      activeTournaments,
      upcomingTournaments,
      totalPlayers,
      activePlayers,
      totalCourses,
      monthlyTournamentGrowth,
      monthlyPlayerGrowth,
      playerParticipationRate
    }
  }, [tournaments, players, courses])

  // Use API stats if available, otherwise use calculated stats
  const stats = dashboardStats || calculatedStats

  // Fallback activity data if API not available
  const fallbackActivity = [
    { id: "1", action: "New player registered", details: "Recent player joined the system", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), entityType: "player" as const },
    { id: "2", action: "Tournament created", details: "New tournament scheduled", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), entityType: "tournament" as const },
    { id: "3", action: "Score submitted", details: "Round scores updated", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), entityType: "score" as const },
    { id: "4", action: "Course updated", details: "Course information updated", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), entityType: "course" as const },
  ]

  const activity = recentActivity || fallbackActivity

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading dashboard data...</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error loading data: {error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Better Golf management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Tournaments"
            value={dashboardStats?.activeTournaments || (Array.isArray(stats.activeTournaments) ? stats.activeTournaments.length : 0)}
            icon={Trophy}
            color="primary"
          />
          <StatCard
            title="Total Players"
            value={dashboardStats?.totalPlayers || stats.totalPlayers || 0}
            icon={Users}
            color="green"
          />
          <StatCard 
            title="Golf Courses" 
            value={dashboardStats?.totalCourses || stats.totalCourses || 0} 
            icon={MapPin} 
            color="blue" 
          />
          <StatCard
            title="Completed Tournaments"
            value={dashboardStats?.completedTournaments || 0}
            icon={Activity}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              title="Create Tournament"
              description="Set up a new golf tournament with all the details"
              icon={Trophy}
              href="/tournaments/new"
              buttonText="Create Tournament"
            />
            <QuickActionCard
              title="Register Player"
              description="Add a new player to the golf club system"
              icon={Users}
              href="/players/new"
              buttonText="Register Player"
            />
            <QuickActionCard
              title="Add Course"
              description="Add a new golf course with hole configurations"
              icon={MapPin}
              href="/courses/new"
              buttonText="Add Course"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Tournaments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Active Tournaments
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/tournaments">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {(Array.isArray(stats.activeTournaments) ? stats.activeTournaments : []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active tournaments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(stats.activeTournaments) ? stats.activeTournaments : []).slice(0, 3).map((tournament: TournamentListGetDTO) => (
                    <div key={tournament.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{tournament.name}</p>
                        <p className="text-sm text-muted-foreground">{tournament.tournamentType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{tournament.playerCount} players</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tournaments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Tournaments
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/tournaments">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {(Array.isArray(stats.upcomingTournaments) ? stats.upcomingTournaments : []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming tournaments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(stats.upcomingTournaments) ? stats.upcomingTournaments : []).slice(0, 3).map((tournament: TournamentListGetDTO) => (
                    <div key={tournament.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{tournament.name}</p>
                        <p className="text-sm text-muted-foreground">{tournament.tournamentType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{tournament.playerCount} players</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity.map((activityItem) => (
                <div key={activityItem.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium">{(activityItem as any).type || (activityItem as any).action}</p>
                    <p className="text-sm text-muted-foreground">{(activityItem as any).description || (activityItem as any).details}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activityItem.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
