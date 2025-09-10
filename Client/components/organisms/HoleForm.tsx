"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HolePostDTO, HoleListGetDTO } from "@/types"

interface HoleFormProps {
  courseId: number
  initialData?: HoleListGetDTO
  onSubmit: (data: HolePostDTO) => void
  onCancel: () => void
  isLoading?: boolean
}

export function HoleForm({ courseId, initialData, onSubmit, onCancel, isLoading }: HoleFormProps) {
  const [formData, setFormData] = useState<HolePostDTO>({
    number: initialData?.number || 1,
    par: initialData?.par || 4,
    strokeIndex: initialData?.strokeIndex || 1,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.number < 1 || formData.number > 36) {
      newErrors.number = "Hole number must be between 1 and 36"
    }

    if (formData.par < 3 || formData.par > 6) {
      newErrors.par = "Par must be between 3 and 6"
    }

    if (formData.strokeIndex < 1 || formData.strokeIndex > 18) {
      newErrors.strokeIndex = "Stroke index must be between 1 and 18"
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

  const updateField = (field: keyof HolePostDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Hole" : "Add New Hole"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Hole Number *</Label>
              <Input
                id="number"
                type="number"
                value={formData.number}
                onChange={(e) => updateField("number", Number.parseInt(e.target.value) || 1)}
                placeholder="1"
                min="1"
                max="36"
                className={errors.number ? "border-destructive" : ""}
              />
              {errors.number && <p className="text-sm text-destructive">{errors.number}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="par">Par *</Label>
              <Input
                id="par"
                type="number"
                value={formData.par}
                onChange={(e) => updateField("par", Number.parseInt(e.target.value) || 4)}
                placeholder="4"
                min="3"
                max="6"
                className={errors.par ? "border-destructive" : ""}
              />
              {errors.par && <p className="text-sm text-destructive">{errors.par}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="strokeIndex">Stroke Index *</Label>
              <Input
                id="strokeIndex"
                type="number"
                value={formData.strokeIndex}
                onChange={(e) => updateField("strokeIndex", Number.parseInt(e.target.value) || 1)}
                placeholder="1"
                min="1"
                max="18"
                className={errors.strokeIndex ? "border-destructive" : ""}
              />
              {errors.strokeIndex && <p className="text-sm text-destructive">{errors.strokeIndex}</p>}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update Hole" : "Add Hole"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

