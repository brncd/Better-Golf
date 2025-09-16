"use client"

import { DashboardView } from "./DashboardView"
import { useDashboardStats, useRecentActivity } from "@/hooks/useDashboard"
import { useTournaments } from "@/hooks/useTournaments"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();
  const { data: tournamentsResponse, isLoading: tournamentsLoading } = useTournaments();

  const isLoading = statsLoading || activityLoading || tournamentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const activeTournaments = tournamentsResponse?.items.filter(t => t.status === 'InProgress') || [];
  const upcomingTournaments = tournamentsResponse?.items.filter(t => t.status === 'OpenRegistration') || [];

  return (
    <DashboardView
      stats={stats}
      activity={activity}
      activeTournaments={activeTournaments}
      upcomingTournaments={upcomingTournaments}
    />
  );
}
