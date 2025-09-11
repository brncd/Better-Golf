"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { CourseTable } from "@/components/organisms/CourseTable"
import { CourseCard } from "@/components/molecules/CourseCard"
import { apiClient } from "@/lib/apiService"
import { CoursesListGetDTO, PaginationResponse } from "@/types"
import { Plus, Grid, List, MapPin } from "lucide-react"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"

export default function CoursesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [courses, setCourses] = useState<CoursesListGetDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get<PaginationResponse<CoursesListGetDTO>>("/api/Courses?pageNumber=1&pageSize=10")
        setCourses(response.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])


  const handleEdit = (id: number) => {
    router.push(`/courses/${id}/edit`)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const { courseService } = await import("@/lib/services")
        await courseService.delete(id.toString())
        // Refresh the courses list
        const response = await apiClient.get<PaginationResponse<CoursesListGetDTO>>("/api/Courses?pageNumber=1&pageSize=10")
        setCourses(response.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete course")
      }
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

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          <p>Error loading courses: {error}</p>
        </div>
      )
    }

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
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Courses</h1>
            <p className="text-muted-foreground">Manage golf courses and hole configurations</p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            <Button asChild>
              <Link href="/courses/new">
                <Plus className="h-4 w-4 mr-2" />
                New Course
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Courses</span>
            </div>
            <p className="text-2xl font-bold mt-1">{courses.length}</p>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </MainLayout>
  )
}

