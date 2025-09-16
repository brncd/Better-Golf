import { DashboardView } from "./DashboardView"
import { getDashboardData } from "@/lib/server/dashboardData"

export default async function DashboardPage() {
  // Fetch all dashboard data server-side to eliminate double loading
  const { stats, activity, activeTournaments, upcomingTournaments } = await getDashboardData()

  return (
    <DashboardView
      stats={stats}
      activity={activity}
      activeTournaments={activeTournaments}
      upcomingTournaments={upcomingTournaments}
    />
  );
}
