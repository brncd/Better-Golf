import { ScoringView } from "./ScoringView"
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
  return (
    <ScoringView />
  )
}
