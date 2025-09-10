"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layouts/MainLayout"
import { CourseForm } from "@/components/organisms/CourseForm"
import type { CoursePostDTO } from "@/types"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewCoursePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CoursePostDTO) => {
    setIsLoading(true)
    try {
      // In real app, this would call API to create course
      console.log("Creating course:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Navigate back to courses list
      router.push("/courses")
    } catch (error) {
      console.error("Error creating course:", error)
    } finally {
      setIsLoading(false)
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
          <h1 className="text-3xl font-bold text-balance">Create New Course</h1>
          <p className="text-muted-foreground">Add a new golf course to the system</p>
        </div>

        {/* Form */}
        <CourseForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </div>
    </MainLayout>
  )
}
