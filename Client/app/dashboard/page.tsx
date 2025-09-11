"use client"

import { MainLayout } from "@/components/layouts/MainLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { StatCard } from "@/components/molecules/StatCard"
import { QuickActionCard } from "@/components/molecules/QuickActionCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { tournamentService, playerService, courseService } from "@/lib/services"
import { useState, useEffect } from "react"
import type { TournamentListGetDTO, PlayerListGetDTO, CoursesListGetDTO } from "@/types"
import { Trophy, Users, MapPin, Calendar, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [tournaments, setTournaments] = useState<TournamentListGetDTO[]>([])
  const [players, setPlayers] = useState<PlayerListGetDTO[]>([])
  const [courses, setCourses] = useState<CoursesListGetDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Since the new DTO doesn't have status, we'll use date-based filtering
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

  const recentActivity = [
    { id: 1, action: "New player registered", details: "John Smith joined the club", time: "2 hours ago" },
    { id: 2, action: "Tournament created", details: "Summer Championship scheduled", time: "4 hours ago" },
    { id: 3, action: "Score submitted", details: "Round 1 scores for Spring Championship", time: "6 hours ago" },
    { id: 4, action: "Course updated", details: "Augusta National hole information updated", time: "1 day ago" },
  ]

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
          <p className="text-muted-foreground">Welcome to Golf Tournament Pro management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Tournaments"
            value={activeTournaments.length}
            icon={Trophy}
            color="primary"
            trend={{ value: 12, label: "from last month" }}
          />
          <StatCard
            title="Total Players"
            value={totalPlayers}
            icon={Users}
            color="green"
            trend={{ value: 8, label: "new this month" }}
          />
          <StatCard title="Golf Courses" value={totalCourses} icon={MapPin} color="blue" />
          <StatCard
            title="Active Players"
            value={activePlayers}
            icon={Activity}
            color="purple"
            trend={{ value: 5, label: "participation rate" }}
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
              {activeTournaments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active tournaments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTournaments.slice(0, 3).map((tournament) => (
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
              {upcomingTournaments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming tournaments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTournaments.slice(0, 3).map((tournament) => (
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
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
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
