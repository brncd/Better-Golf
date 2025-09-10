import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface TournamentTypeBadgeProps {
  type: "MedalPlay" | "Stableford" | "MatchPlay"
  className?: string
}

export function TournamentTypeBadge({ type, className }: TournamentTypeBadgeProps) {
  const labels = {
    MedalPlay: "Medal Play",
    Stableford: "Stableford",
    MatchPlay: "Match Play",
  }

  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      {labels[type]}
    </Badge>
  )
}
