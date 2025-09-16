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
  const [formData, setFormData] = useState<Partial<HolePostDTO>>({
    holeNumber: initialData?.holeNumber || 1,
    par: initialData?.par || 4,
    handicap: initialData?.handicap || 1,
    yardage: initialData?.yardage || 150,
    description: initialData?.description || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.holeNumber || formData.holeNumber < 1 || formData.holeNumber > 18) {
      newErrors.holeNumber = "Hole number must be between 1 and 18"
    }
    if (!formData.par || formData.par < 3 || formData.par > 5) {
      newErrors.par = "Par must be between 3 and 5"
    }
    if (!formData.handicap || formData.handicap < 1 || formData.handicap > 18) {
      newErrors.handicap = "Handicap must be between 1 and 18"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData as HolePostDTO)
    }
  }

  const updateField = (field: keyof HolePostDTO, value: string | number) => {
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
              <Label htmlFor="holeNumber">Hole Number *</Label>
              <Input
                id="holeNumber"
                type="number"
                value={formData.holeNumber}
                onChange={(e) => updateField("holeNumber", parseInt(e.target.value) || 0)}
                className={errors.holeNumber ? "border-destructive" : ""}
                placeholder="Enter hole number"
                min="1"
                max="18"
              />
              {errors.holeNumber && <p className="text-sm text-destructive">{errors.holeNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="par">Par *</Label>
              <Input
                id="par"
                type="number"
                value={formData.par}
                onChange={(e) => updateField("par", parseInt(e.target.value) || 4)}
                placeholder="4"
                min="3"
                max="5"
                className={errors.par ? "border-destructive" : ""}
              />
              {errors.par && <p className="text-sm text-destructive">{errors.par}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="handicap">Handicap *</Label>
              <Input
                id="handicap"
                type="number"
                value={formData.handicap}
                onChange={(e) => updateField("handicap", parseInt(e.target.value) || 0)}
                className={errors.handicap ? "border-destructive" : ""}
                placeholder="Enter handicap"
                min="1"
                max="18"
              />
              {errors.handicap && <p className="text-sm text-destructive">{errors.handicap}</p>}
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

