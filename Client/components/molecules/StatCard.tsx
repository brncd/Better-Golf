import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  color?: "primary" | "green" | "blue" | "purple" | "orange"
}

export function StatCard({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "text-primary",
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className={trend.value >= 0 ? "text-green-600" : "text-red-600"}>
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value}%
                </span>{" "}
                {trend.label}
              </p>
            )}
          </div>
          <Icon className={cn("h-8 w-8", colorClasses[color])} />
        </div>
      </CardContent>
    </Card>
  )
}
