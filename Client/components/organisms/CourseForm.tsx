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
  const [formData, setFormData] = useState<CoursePostDTO>({
    name: initialData?.name || "",
    location: initialData?.location || "",
    numberOfHoles: initialData?.numberOfHoles || 18,
    description: initialData?.description || "",
    rating: initialData?.rating || undefined,
    slope: initialData?.slope || undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (formData.numberOfHoles < 1 || formData.numberOfHoles > 36) {
      newErrors.numberOfHoles = "Number of holes must be between 1 and 36"
    }

    if (formData.rating && (formData.rating < 60 || formData.rating > 80)) {
      newErrors.rating = "Course rating must be between 60 and 80"
    }

    if (formData.slope && (formData.slope < 55 || formData.slope > 155)) {
      newErrors.slope = "Slope rating must be between 55 and 155"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const updateField = (field: keyof CoursePostDTO, value: any) => {
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
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Enter course location"
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfHoles">Number of Holes *</Label>
              <Input
                id="numberOfHoles"
                type="number"
                value={formData.numberOfHoles}
                onChange={(e) => updateField("numberOfHoles", Number.parseInt(e.target.value) || 18)}
                placeholder="18"
                min="1"
                max="36"
                className={errors.numberOfHoles ? "border-destructive" : ""}
              />
              {errors.numberOfHoles && <p className="text-sm text-destructive">{errors.numberOfHoles}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Course Rating</Label>
              <Input
                id="rating"
                type="number"
                value={formData.rating || ""}
                onChange={(e) => updateField("rating", e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                placeholder="72.5"
                min="60"
                max="80"
                step="0.1"
                className={errors.rating ? "border-destructive" : ""}
              />
              {errors.rating && <p className="text-sm text-destructive">{errors.rating}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slope">Slope Rating</Label>
              <Input
                id="slope"
                type="number"
                value={formData.slope || ""}
                onChange={(e) => updateField("slope", e.target.value ? Number.parseInt(e.target.value) : undefined)}
                placeholder="113"
                min="55"
                max="155"
                className={errors.slope ? "border-destructive" : ""}
              />
              {errors.slope && <p className="text-sm text-destructive">{errors.slope}</p>}
            </div>
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
