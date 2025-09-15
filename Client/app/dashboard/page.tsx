import { MainLayout } from "@/components/layouts/MainLayout"
import { DashboardView } from "./DashboardView"
import { dashboardService } from "@/lib/services"
import { getSession } from "@/lib/auth-server"

async function getDashboardData() {
  try {
    const stats = await dashboardService.getStats();
    const activity = await dashboardService.getRecentActivity();
    
    return {
      stats,
      activity,
      activeTournaments: [],
      upcomingTournaments: [],
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return {
      stats: {
        totalTournaments: 0,
        activeTournaments: 0,
        upcomingTournaments: 0,
        completedTournaments: 0,
        totalPlayers: 0,
        totalCourses: 0,
        averagePlayersPerTournament: 0,
        totalRoundsPlayed: 0,
      },
      activity: [],
      activeTournaments: [],
      upcomingTournaments: [],
    };
  }
}

export default async function DashboardPage() {
  const user = await getSession();
  const { stats, activity, activeTournaments, upcomingTournaments } = await getDashboardData();

  return (
    <MainLayout user={user}>
      <DashboardView 
        stats={stats} 
        activity={activity} 
        activeTournaments={activeTournaments} 
        upcomingTournaments={upcomingTournaments} 
      />
    </MainLayout>
  )
}
