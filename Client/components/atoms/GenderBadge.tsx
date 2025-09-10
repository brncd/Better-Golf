import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface GenderBadgeProps {
  gender: "male" | "female" | "other"
  className?: string
}

export function GenderBadge({ gender, className }: GenderBadgeProps) {
  const variants = {
    male: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    female: "bg-pink-100 text-pink-800 hover:bg-pink-100",
    other: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  }

  const labels = {
    male: "Male",
    female: "Female",
    other: "Other",
  }

  return (
    <Badge variant="secondary" className={cn(variants[gender], className)}>
      {labels[gender]}
    </Badge>
  )
}
