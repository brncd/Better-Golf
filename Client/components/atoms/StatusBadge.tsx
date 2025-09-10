import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: "Draft" | "OpenRegistration" | "InProgress" | "Completed" | "Archived";
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    Draft: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    OpenRegistration: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    InProgress: "bg-green-100 text-green-800 hover:bg-green-100",
    Completed: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    Archived: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  }

  const labels = {
    Draft: "Draft",
    OpenRegistration: "Open Registration",
    InProgress: "In Progress",
    Completed: "Completed",
    Archived: "Archived",
  }

  return (
    <Badge variant="secondary" className={cn(variants[status], className)}>
      {labels[status]}
    </Badge>
  )
}
