"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ParBadge } from "@/components/atoms/ParBadge"
import type { HoleListGetDTO } from "@/types"
import { Edit, Trash2 } from "lucide-react"

interface HoleCardProps {
  hole: HoleListGetDTO
  onEdit?: (hole: HoleListGetDTO) => void
  onDelete?: (id: number) => void
}

export function HoleCard({ hole, onEdit, onDelete }: HoleCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Hole {hole.number}</CardTitle>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(hole)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(hole.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <ParBadge par={hole.par} />
        </div>

        <div className="text-sm text-muted-foreground">
          <span>Stroke Index: {hole.strokeIndex}</span>
        </div>
      </CardContent>
    </Card>
  )
}
