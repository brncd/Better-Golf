"use client"

import { MainLayout } from "@/components/layouts/MainLayout"
import { DashboardView } from "./DashboardView"
import { dashboardService } from "@/lib/services"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useQuery } from "@tanstack/react-query"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardService.getRecentActivity(),
  });

  const isLoading = statsLoading || activityLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <DashboardView 
          stats={stats || {
            totalTournaments: 0,
            activeTournaments: 0,
            upcomingTournaments: 0,
            completedTournaments: 0,
            totalPlayers: 0,
            totalCourses: 0,
            averagePlayersPerTournament: 0,
            totalRoundsPlayed: 0,
          }} 
          activity={activity || []} 
          activeTournaments={[]} 
          upcomingTournaments={[]} 
        />
      </MainLayout>
    </ProtectedRoute>
  )
}
