"use client"

import { useParams, useRouter } from "next/navigation"
import { CourseForm } from "@/components/organisms/CourseForm"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useCourse, useUpdateCourse } from "@/hooks/useCourses"
import type { CoursePostDTO, SingleCourseDTO } from "@/types"

interface EditCoursePageProps {
  params: { id: string }
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number(params.id)
  
  const { data: course, isLoading, error } = useCourse(courseId)
  const updateCourseMutation = useUpdateCourse()

  const handleSubmit = async (data: CoursePostDTO) => {
    try {
      await updateCourseMutation.mutateAsync({ id: courseId, data })
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error('Failed to update course:', error)
    }
  }

  const handleCancel = () => {
    router.push(`/courses/${courseId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <Button asChild>
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  const initialData: CoursePostDTO = {
    name: course.name,
    courseSlope: course.courseSlope || 113,
    courseRating: course.courseRating || 72.0,
    par: course.par || 72
  }

  return (
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

      <CourseForm initialData={initialData} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
