import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ParBadgeProps {
  par: number
  className?: string
}

export function ParBadge({ par, className }: ParBadgeProps) {
  const getParColor = (par: number) => {
    if (par === 3) return "bg-green-100 text-green-800 hover:bg-green-100"
    if (par === 4) return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    if (par === 5) return "bg-purple-100 text-purple-800 hover:bg-purple-100"
    return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }

  return (
    <Badge variant="secondary" className={cn(getParColor(par), className)}>
      Par {par}
    </Badge>
  )
}
