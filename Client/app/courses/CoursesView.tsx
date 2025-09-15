"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/molecules/CourseCard"
import { CourseTable } from "@/components/organisms/CourseTable"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"
import { useCourses, useDeleteCourse } from "@/hooks/useCourses";
import { CoursesListGetDTO, PaginationResponse } from "@/types";

interface CoursesViewProps {
  initialCourses: CoursesListGetDTO[];
}

export function CoursesView({ initialCourses }: CoursesViewProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null)
  const { data: coursesResponse, isLoading } = useCourses(
    { pageNumber: 1, pageSize: 50 },
    { 
      initialData: { 
        items: initialCourses, 
        pageNumber: 1, 
        pageSize: 50, 
        totalPages: 1, 
        totalCount: initialCourses.length 
      } as PaginationResponse<CoursesListGetDTO>
    }
  );
  const deleteCourseMutation = useDeleteCourse()

  const courses = coursesResponse?.items || []

  const handleEdit = (id: number) => {
    router.push(`/courses/${id}/edit`)
  }

  const handleDelete = (id: number) => {
    setDeletingCourseId(id)
  }

  const confirmDelete = async () => {
    if (!deletingCourseId) return
    deleteCourseMutation.mutate(deletingCourseId)
    setDeletingCourseId(null)
  }

  const renderContent = () => {
    if (courses.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No courses available</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first golf course</p>
          <Button asChild>
            <Link href="/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Link>
          </Button>
        </div>
      )
    }

    if (viewMode === "table") {
      return <CourseTable courses={courses} onEdit={handleEdit} onDelete={handleDelete} />
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg p-1">
            <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
            >
                <Grid className="h-4 w-4" />
            </Button>
            </div>
        </div>
        {renderContent()}
        <ConfirmDialog
            open={deletingCourseId !== null}
            onOpenChange={(open) => !open && setDeletingCourseId(null)}
            title="Delete Course"
            description="Are you sure you want to delete this course? This action cannot be undone."
            onConfirm={confirmDelete}
        />
    </div>
  )
}
