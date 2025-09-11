"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { courseService } from "@/lib/services"
import type { TournamentPostDTO, CoursesListGetDTO } from "@/types"

interface TournamentFormProps {
  initialData?: Partial<TournamentPostDTO>
  onSubmit: (data: TournamentPostDTO) => void
  onCancel: () => void
  isLoading?: boolean
  error?: string | null
}

export function TournamentForm({ initialData, onSubmit, onCancel, isLoading, error }: TournamentFormProps) {
  const [courses, setCourses] = useState<CoursesListGetDTO[]>([]);
  const [formData, setFormData] = useState<TournamentPostDTO>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    type: initialData?.type || "StrokePlay",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    courseId: initialData?.courseId || "",
    maxPlayers: initialData?.maxPlayers || 0,
    handicapAllowance: initialData?.handicapAllowance || 100,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseService.getAll({ pageNumber: 1, pageSize: 100 });
        setCourses(response.items);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Tournament name is required"
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required"
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required"
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "End date must be after start date"
    }

    if (!formData.courseId) {
      newErrors.courseId = "Course selection is required"
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

  const updateField = (field: keyof TournamentPostDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter tournament name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tournament Type *</Label>
              <Select value={formData.type} onValueChange={(value) => updateField("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tournament type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="StrokePlay">Stroke Play</SelectItem>
                  <SelectItem value="MatchPlay">Match Play</SelectItem>
                  <SelectItem value="Stableford">Stableford</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Enter tournament description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule & Venue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className={errors.startDate ? "border-destructive" : ""}
              />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className={errors.endDate ? "border-destructive" : ""}
              />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseId">Course *</Label>
            <Select value={formData.courseId} onValueChange={(value) => updateField("courseId", value)}>
              <SelectTrigger className={errors.courseId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courseId && <p className="text-sm text-destructive">{errors.courseId}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registration & Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Maximum Players</Label>
              <Input
                id="maxPlayers"
                type="number"
                value={formData.maxPlayers || ""}
                onChange={(e) =>
                  updateField("maxPlayers", e.target.value ? Number.parseInt(e.target.value) : 0)
                }
                placeholder="Enter max players"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="handicapAllowance">Handicap Allowance (%)</Label>
              <Input
                id="handicapAllowance"
                type="number"
                value={formData.handicapAllowance || ""}
                onChange={(e) =>
                  updateField("handicapAllowance", e.target.value ? Number.parseInt(e.target.value) : 100)
                }
                placeholder="e.g., 90 for 90%"
                min="0"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Tournament" : "Create Tournament"}
        </Button>
      </div>
    </form>
  )
}
