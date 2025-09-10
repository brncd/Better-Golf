import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ScoreBadgeProps {
  score: number
  par: number
  className?: string
}

export function ScoreBadge({ score, par, className }: ScoreBadgeProps) {
  const relative = score - par

  const getScoreColor = (relative: number) => {
    if (relative <= -2) return "bg-purple-100 text-purple-800 hover:bg-purple-100" // Eagle or better
    if (relative === -1) return "bg-green-100 text-green-800 hover:bg-green-100" // Birdie
    if (relative === 0) return "bg-blue-100 text-blue-800 hover:bg-blue-100" // Par
    if (relative === 1) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" // Bogey
    if (relative === 2) return "bg-orange-100 text-orange-800 hover:bg-orange-100" // Double bogey
    return "bg-red-100 text-red-800 hover:bg-red-100" // Triple bogey or worse
  }

  const getScoreLabel = (relative: number) => {
    if (relative <= -3) return "Albatross"
    if (relative === -2) return "Eagle"
    if (relative === -1) return "Birdie"
    if (relative === 0) return "Par"
    if (relative === 1) return "Bogey"
    if (relative === 2) return "Double"
    if (relative === 3) return "Triple"
    return `+${relative}`
  }

  return (
    <Badge variant="secondary" className={cn(getScoreColor(relative), className)}>
      {score} ({relative > 0 ? "+" : ""}
      {relative === 0 ? "E" : relative})
    </Badge>
  )
}
