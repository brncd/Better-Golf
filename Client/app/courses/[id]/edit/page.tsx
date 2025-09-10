"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { CourseForm } from "@/components/organisms/CourseForm"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { mockCourses } from "@/data/mockData"
import type { CourseCreateDTO } from "@/types"

interface EditCoursePageProps {
  params: { id: string }
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const router = useRouter()
  const [course, setCourse] = useState<CourseCreateDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const foundCourse = mockCourses.find((c) => c.id === params.id)
    if (foundCourse) {
      setCourse({
        name: foundCourse.name,
        location: foundCourse.location,
        description: foundCourse.description,
        par: foundCourse.par,
        length: foundCourse.length,
        rating: foundCourse.rating,
        slope: foundCourse.slope,
      })
    }
    setIsLoading(false)
  }, [params.id])

  const handleSubmit = async (data: CourseCreateDTO) => {
    console.log("[v0] Updating course:", data)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push(`/courses/${params.id}`)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Button asChild>
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/courses/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Course</h1>
            <p className="text-muted-foreground">Update course information and layout</p>
          </div>
        </div>

        <CourseForm initialData={course} onSubmit={handleSubmit} submitLabel="Update Course" />
      </div>
    </MainLayout>
  )
}
