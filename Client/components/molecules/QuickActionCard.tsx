import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  buttonText: string
}

export function QuickActionCard({ title, description, icon: Icon, href, buttonText }: QuickActionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            <Button asChild size="sm">
              <Link href={href}>{buttonText}</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
