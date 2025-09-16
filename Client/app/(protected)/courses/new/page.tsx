"use client"

import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { CourseForm } from "@/components/organisms/CourseForm"
import { useCreateCourse } from "@/hooks/useCourses"
import type { CoursePostDTO } from "@/types"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewCoursePage() {
  const router = useRouter()
  const createCourseMutation = useCreateCourse()

  const handleSubmit = async (data: CoursePostDTO) => {
    try {
      await createCourseMutation.mutateAsync(data)
      router.push("/courses")
    } catch (error) {
      console.error("Error creating course:", error)
      // Error handling is done in the mutation hook
    }
  }

  const handleCancel = () => {
    router.push("/courses")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-balance">Add New Course</h1>
          <p className="text-muted-foreground">Create a new golf course</p>
        </div>

        {/* Form */}
        <CourseForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={createCourseMutation.isPending} />
      </div>
    </MainLayout>
  )
}