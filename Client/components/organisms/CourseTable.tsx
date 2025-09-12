"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RoleGuard } from "@/components/auth/RoleGuard"
import type { CoursesListGetDTO } from "@/types"
import { Eye, Edit, Trash2, Search } from "lucide-react"

interface CourseTableProps {
  courses: CoursesListGetDTO[]
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export function CourseTable({ courses, onEdit, onDelete }: CourseTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Course</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{course.name}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/courses/${course.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      <RoleGuard roles={["Admin", "TournamentOrganizer"]}>
                        {onEdit && (
                          <Button variant="ghost" size="sm" onClick={() => onEdit(course.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        {onDelete && (
                          <Button variant="ghost" size="sm" onClick={() => onDelete(course.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </RoleGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

