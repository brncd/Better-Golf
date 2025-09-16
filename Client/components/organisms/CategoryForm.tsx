"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryPostDTO, SingleCategoryDTO } from "@/types"

interface CategoryFormProps {
  initialData?: SingleCategoryDTO
  onSubmit: (data: CategoryPostDTO) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CategoryForm({ initialData, onSubmit, onCancel, isLoading }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryPostDTO>({
    name: initialData?.name || "",
    sex: initialData?.sex || "Mixed",
    minAge: initialData?.minAge || 0,
    maxAge: initialData?.maxAge || 99,
    minHcap: initialData?.minHcap || 0,
    maxHcap: initialData?.maxHcap || 54,
    numberOfHoles: initialData?.numberOfHoles || 18,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required"
    }

    if (formData.minHcap > formData.maxHcap) {
      newErrors.maxHcap = "Maximum handicap must be greater than minimum"
    }

    if (formData.minAge > formData.maxAge) {
      newErrors.maxAge = "Maximum age must be greater than minimum"
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

  const updateField = (field: keyof CategoryPostDTO, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Category" : "Create New Category"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter category name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Gender Restriction</Label>
              <Select
                value={formData.sex}
                onValueChange={(value) => updateField("sex", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender restriction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Ladies">Ladies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minHcap">Minimum Handicap</Label>
              <Input
                id="minHcap"
                type="number"
                value={formData.minHcap}
                onChange={(e) => updateField("minHcap", e.target.value ? Number.parseFloat(e.target.value) : 0)}
                placeholder="0.0"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxHcap">Maximum Handicap</Label>
              <Input
                id="maxHcap"
                type="number"
                value={formData.maxHcap}
                onChange={(e) => updateField("maxHcap", e.target.value ? Number.parseFloat(e.target.value) : 0)}
                placeholder="54.0"
                step="0.1"
                className={errors.maxHcap ? "border-destructive" : ""}
              />
              {errors.maxHcap && <p className="text-sm text-destructive">{errors.maxHcap}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAge">Minimum Age</Label>
              <Input
                id="minAge"
                type="number"
                value={formData.minAge}
                onChange={(e) => updateField("minAge", e.target.value ? Number.parseInt(e.target.value) : 0)}
                placeholder="18"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAge">Maximum Age</Label>
              <Input
                id="maxAge"
                type="number"
                value={formData.maxAge}
                onChange={(e) => updateField("maxAge", e.target.value ? Number.parseInt(e.target.value) : 0)}
                placeholder="99"
                className={errors.maxAge ? "border-destructive" : ""}
              />
              {errors.maxAge && <p className="text-sm text-destructive">{errors.maxAge}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numberOfHoles">Number of Holes</Label>
            <Input
              id="numberOfHoles"
              type="number"
              value={formData.numberOfHoles}
              onChange={(e) => updateField("numberOfHoles", e.target.value ? Number.parseInt(e.target.value) : 18)}
              placeholder="18"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

