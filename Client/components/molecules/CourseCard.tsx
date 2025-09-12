"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/auth/RoleGuard"
import type { CoursesListGetDTO } from "@/types"
import { MapPin, Eye, Edit, Trash2 } from "lucide-react"

interface CourseCardProps {
  course: CoursesListGetDTO
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-balance">{course.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Course ID: {course.id}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
          <Link href={`/courses/${course.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Link>
        </Button>

        <RoleGuard roles={["Admin", "TournamentOrganizer"]}>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(course.id)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button variant="outline" size="sm" onClick={() => onDelete(course.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </RoleGuard>
      </CardFooter>
    </Card>
  )
}
