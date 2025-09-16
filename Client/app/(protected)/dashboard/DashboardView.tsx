"use client"

import { MainLayout } from "@/components/layouts/MainLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { StatCard } from "@/components/molecules/StatCard"
import { QuickActionCard } from "@/components/molecules/QuickActionCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { TournamentListGetDTO, PlayerListGetDTO, CoursesListGetDTO } from "@/types"
import { Trophy, Users, MapPin, Calendar, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"
import { DashboardStats, RecentActivity } from "@/lib/services/dashboardService"

interface DashboardViewProps {
  stats: DashboardStats;
  activity: RecentActivity[];
  activeTournaments: TournamentListGetDTO[];
  upcomingTournaments: TournamentListGetDTO[];
}

export function DashboardView({ stats, activity, activeTournaments, upcomingTournaments }: DashboardViewProps) {
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
            value={stats.activeTournaments || 0}
            icon={Trophy}
            color="primary"
          />
          <StatCard
            title="Total Players"
            value={stats.totalPlayers || 0}
            icon={Users}
            color="green"
          />
          <StatCard 
            title="Golf Courses" 
            value={stats.totalCourses || 0} 
            icon={MapPin} 
            color="blue" 
          />
          <StatCard
            title="Completed Tournaments"
            value={stats.completedTournaments || 0}
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
              {activeTournaments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active tournaments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTournaments.slice(0, 3).map((tournament: TournamentListGetDTO) => (
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
                  {upcomingTournaments.slice(0, 3).map((tournament: TournamentListGetDTO) => (
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
                    <p className="font-medium">{activityItem.type}</p>
                    <p className="text-sm text-muted-foreground">{activityItem.description}</p>
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
