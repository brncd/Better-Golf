import { MainLayout } from "@/components/layouts/MainLayout"
import { ScoringView } from "./ScoringView"
import { useAuth } from "@/context/AuthContext"
import { scoringService } from "@/lib/services/scoringService"

async function getActiveTournaments() {
  try {
    const tournaments = await scoringService.getActiveTournaments();
    return tournaments || [];
  } catch (error) {
    console.error("Failed to fetch active tournaments:", error);
    return [];
  }
}

export default function ScoringPage() {
  const { user } = useAuth();

  return (
    <MainLayout user={user}>
      <ScoringView />
    </MainLayout>
  )
}
