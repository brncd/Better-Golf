import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PositionBadgeProps {
  position: number
  className?: string
}

export function PositionBadge({ position, className }: PositionBadgeProps) {
  const getPositionColor = (pos: number) => {
    if (pos === 1) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300"
    if (pos === 2) return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-300"
    if (pos === 3) return "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-300"
    if (pos <= 10) return "bg-green-100 text-green-800 hover:bg-green-100"
    return "bg-muted text-muted-foreground hover:bg-muted"
  }

  const getPositionSuffix = (pos: number) => {
    if (pos % 100 >= 11 && pos % 100 <= 13) return "th"
    switch (pos % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  return (
    <Badge variant="secondary" className={cn(getPositionColor(position), "font-bold", className)}>
      {position}
      {getPositionSuffix(position)}
    </Badge>
  )
}
