"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/molecules/CourseCard"
import { CourseTable } from "@/components/organisms/CourseTable"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { useCourses, useDeleteCourse } from "@/hooks/useCourses"
import { courseService } from "@/lib/services"
import { CoursesListGetDTO, PaginationResponse } from "@/types"
import { Plus, Grid, List, MapPin } from "lucide-react"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function CoursesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [courses, setCourses] = useState<CoursesListGetDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null)
  const { handleError, clearError } = useErrorHandler({ context: 'CoursesPage' })
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const response = await courseService.getAll({ pageNumber: 1, pageSize: 10 })
        setCourses(response.items)
      } catch (err) {
        handleError(err, 'Failed to fetch courses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])


  const handleEdit = (id: number) => {
    router.push(`/courses/${id}/edit`)
  }

  const handleDelete = (id: number) => {
    setDeletingCourseId(id)
  }

  const confirmDelete = async () => {
    if (!deletingCourseId) return
    
    try {
      setIsLoading(true)
      await courseService.delete(deletingCourseId)
      // Refresh the courses list
      const response = await courseService.getAll({ pageNumber: 1, pageSize: 10 })
      setCourses(response.items)
      setDeletingCourseId(null)
      toast({
        title: "Success",
        description: "Course deleted successfully",
      })
    } catch (err) {
      handleError(err, 'Failed to delete course')
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    // Error handling is now managed by useErrorHandler hook

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
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Golf Courses</h1>
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
              <RoleGuard roles={["Admin", "TournamentOrganizer"]}>
                <Button asChild>
                  <Link href="/courses/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Link>
                </Button>
              </RoleGuard>
            </div>
          </div>
          {renderContent()}
        </div>
        <ConfirmDialog
          open={deletingCourseId !== null}
          onOpenChange={(open) => !open && setDeletingCourseId(null)}
          title="Delete Course"
          description="Are you sure you want to delete this course? This action cannot be undone."
          onConfirm={confirmDelete}
        />
      </MainLayout>
    </ProtectedRoute>
  )
}