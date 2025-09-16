"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CoursePostDTO } from "@/types"

interface CourseFormProps {
  initialData?: Partial<CoursePostDTO>
  onSubmit: (data: CoursePostDTO) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CourseForm({ initialData, onSubmit, onCancel, isLoading }: CourseFormProps) {
  const [formData, setFormData] = useState<Partial<CoursePostDTO>>({
    name: initialData?.name || "",
    courseSlope: initialData?.courseSlope || 113,
    courseRating: initialData?.courseRating || 72,
    par: initialData?.par || 72,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = "Course name is required"
    }
    if (!formData.courseRating || formData.courseRating < 60 || formData.courseRating > 80) {
      newErrors.courseRating = "Course rating must be between 60 and 80"
    }
    if (!formData.courseSlope || formData.courseSlope < 55 || formData.courseSlope > 155) {
      newErrors.courseSlope = "Course slope must be between 55 and 155"
    }
    if (!formData.par || formData.par < 60 || formData.par > 80) {
      newErrors.par = "Course par must be between 60 and 80"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData as CoursePostDTO)
    }
  }

  const updateField = (field: keyof CoursePostDTO, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter course name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseRating">Course Rating *</Label>
              <Input
                id="courseRating"
                type="number"
                value={formData.courseRating}
                onChange={(e) => updateField("courseRating", parseFloat(e.target.value) || 0)}
                className={errors.courseRating ? "border-destructive" : ""}
                placeholder="Enter course rating"
                min="60"
                max="80"
                step="0.1"
              />
              {errors.courseRating && <p className="text-sm text-destructive">{errors.courseRating}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Enter course description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="par">Course Par</Label>
            <Input
              id="par"
              type="number"
              value={formData.par}
              onChange={(e) => updateField("par", parseInt(e.target.value) || 0)}
              className={errors.par ? "border-destructive" : ""}
              placeholder="Enter course par"
              min="60"
              max="80"
            />
            {errors.par && <p className="text-sm text-destructive">{errors.par}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slope">Slope Rating</Label>
            <Input
              id="slope"
              type="number"
              value={formData.courseSlope || ""}
              onChange={(e) => updateField("courseSlope", parseInt(e.target.value) || 0)}
              placeholder="113"
              min="55"
              max="155"
              className={errors.courseSlope ? "border-destructive" : ""}
            />
            {errors.courseSlope && <p className="text-sm text-destructive">{errors.courseSlope}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </form>
  )
}
