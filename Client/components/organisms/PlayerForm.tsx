"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PlayerPostDTO } from "@/types"

interface PlayerFormProps {
  initialData?: Partial<PlayerPostDTO>
  onSubmit: (data: PlayerPostDTO) => void
  onCancel: () => void
  isLoading?: boolean
}

export function PlayerForm({ initialData, onSubmit, onCancel, isLoading }: PlayerFormProps) {
  const [formData, setFormData] = useState<PlayerPostDTO>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    handicap: initialData?.handicap || 0,
    gender: initialData?.gender || "male",
    dateOfBirth: initialData?.dateOfBirth || "",
    phoneNumber: initialData?.phoneNumber || "",
    membershipNumber: initialData?.membershipNumber || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.handicap < 0 || formData.handicap > 54) {
      newErrors.handicap = "Handicap must be between 0 and 54"
    }

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 5 || age > 120) {
        newErrors.dateOfBirth = "Please enter a valid birth date"
      }
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-$$$$]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number"
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

  const updateField = (field: keyof PlayerPostDTO, value: string | number | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Enter first name"
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Enter last name"
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateField("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
                className={errors.phoneNumber ? "border-destructive" : ""}
              />
              {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                className={errors.dateOfBirth ? "border-destructive" : ""}
              />
              {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="handicap">Handicap *</Label>
              <Input
                id="handicap"
                type="number"
                value={formData.handicap}
                onChange={(e) => updateField("handicap", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                min="0"
                max="54"
                step="0.1"
                className={errors.handicap ? "border-destructive" : ""}
              />
              {errors.handicap && <p className="text-sm text-destructive">{errors.handicap}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Golf Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="membershipNumber">Membership Number</Label>
              <Input
                id="membershipNumber"
                value={formData.membershipNumber}
                onChange={(e) => updateField("membershipNumber", e.target.value)}
                placeholder="Enter membership number"
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
          {isLoading ? "Saving..." : initialData ? "Update Player" : "Create Player"}
        </Button>
      </div>
    </form>
  )
}
