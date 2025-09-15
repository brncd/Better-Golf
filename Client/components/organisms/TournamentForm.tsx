"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCourses } from "@/hooks/useCourses"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import type { RoundInfo, CoursesListGetDTO } from "@/types";
import { TournamentType } from "@/types"

// This interface represents the form's state, not the final DTO
export interface TournamentFormState {
  name: string;
  description: string;
  tournamentType: string;
  courseId: number | null;
  startDate: string;
  endDate: string;
  handicapAllowance: number;
  roundInfo: {
    startTime: string;
    endTime: string;
    intervalMinutes: number;
    maxPlayersPerGroup: number;
  };
}

interface TournamentFormProps {
  // Let the form accept a partial state for initialization
  initialData?: Partial<TournamentFormState>
  onSubmit: (data: TournamentFormState) => void
  onCancel: () => void
  isLoading?: boolean
  error?: string | null
}

export function TournamentForm({ initialData, onSubmit, onCancel, isLoading, error }: TournamentFormProps) {
  const { data: coursesResponse, isLoading: coursesLoading } = useCourses({ pageNumber: 1, pageSize: 100 })
  const courses: CoursesListGetDTO[] = coursesResponse?.items || [];

  const [formData, setFormData] = useState<TournamentFormState>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    tournamentType: initialData?.tournamentType || TournamentType.MedalPlay,
    courseId: initialData?.courseId || null,
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    handicapAllowance: initialData?.handicapAllowance || 100,
    roundInfo: initialData?.roundInfo || {
      startTime: "08:00",
      endTime: "16:00",
      intervalMinutes: 10,
      maxPlayersPerGroup: 4,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Tournament name is required"
    if (!formData.courseId) newErrors.courseId = "Course selection is required"
    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "End date must be after start date"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Pass the raw form state up to the parent page component
      onSubmit(formData);
    }
  }

  const updateField = (field: keyof TournamentFormState, value: any) => {
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
              <Label htmlFor="tournamentType">Tournament Type *</Label>
              <Select value={formData.tournamentType} onValueChange={(value: string) => updateField("tournamentType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tournament type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TournamentType.MedalPlay}>Stroke Play</SelectItem>
                  <SelectItem value={TournamentType.MatchPlay}>Match Play</SelectItem>
                  <SelectItem value={TournamentType.Stableford}>Stableford</SelectItem>
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
          <div className="space-y-2">
            <Label htmlFor="courseId">Golf Course *</Label>
            {coursesLoading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-muted-foreground">Loading courses...</span>
              </div>
            ) : (
              <Select 
                value={formData.courseId?.toString() || ""} 
                onValueChange={(value) => updateField("courseId", value ? parseInt(value) : null)}
              >
                <SelectTrigger className={errors.courseId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a golf course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name} ({course.holes?.length || 18} holes)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.courseId && <p className="text-sm text-destructive">{errors.courseId}</p>}
          </div>

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Round Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.roundInfo.startTime}
                onChange={(e) => updateField("roundInfo", { ...formData.roundInfo, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.roundInfo.endTime}
                onChange={(e) => updateField("roundInfo", { ...formData.roundInfo, endTime: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intervalMinutes">Interval Between Groups (minutes)</Label>
              <Input
                id="intervalMinutes"
                type="number"
                value={formData.roundInfo.intervalMinutes}
                onChange={(e) => updateField("roundInfo", { ...formData.roundInfo, intervalMinutes: parseInt(e.target.value) || 10 })}
                placeholder="10"
                min="5"
                max="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPlayersPerGroup">Max Players Per Group</Label>
              <Input
                id="maxPlayersPerGroup"
                type="number"
                value={formData.roundInfo.maxPlayersPerGroup}
                onChange={(e) => updateField("roundInfo", { ...formData.roundInfo, maxPlayersPerGroup: parseInt(e.target.value) || 4 })}
                placeholder="4"
                min="1"
                max="4"
              />
            </div>
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
