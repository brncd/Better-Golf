import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface HandicapBadgeProps {
  handicap: number
  className?: string
}

export function HandicapBadge({ handicap, className }: HandicapBadgeProps) {
  const getHandicapColor = (handicap: number) => {
    if (handicap <= 5) return "bg-green-100 text-green-800 hover:bg-green-100"
    if (handicap <= 12) return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    if (handicap <= 20) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    return "bg-orange-100 text-orange-800 hover:bg-orange-100"
  }

  return (
    <Badge variant="secondary" className={cn(getHandicapColor(handicap), className)}>
      {handicap.toFixed(1)}
    </Badge>
  )
}
