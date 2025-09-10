import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface RoleBadgeProps {
  role: "admin" | "tournament-director" | "player" | "viewer"
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const variants = {
    admin: "bg-red-100 text-red-800 hover:bg-red-100",
    "tournament-director": "bg-blue-100 text-blue-800 hover:bg-blue-100",
    player: "bg-green-100 text-green-800 hover:bg-green-100",
    viewer: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  }

  const labels = {
    admin: "Admin",
    "tournament-director": "Tournament Director",
    player: "Player",
    viewer: "Viewer",
  }

  return (
    <Badge variant="secondary" className={cn(variants[role], className)}>
      {labels[role]}
    </Badge>
  )
}
