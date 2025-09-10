import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface YardageBadgeProps {
  yardage: number
  className?: string
}

export function YardageBadge({ yardage, className }: YardageBadgeProps) {
  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      {yardage.toLocaleString()} yds
    </Badge>
  )
}
