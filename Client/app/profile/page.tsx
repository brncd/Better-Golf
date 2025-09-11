"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { playerService } from "@/lib/services"
import { useAuth } from "@/context/AuthContext"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { useToast } from "@/hooks/use-toast"
import { PlayerProfileDTO } from "@/types"
import { User, Save, Edit, Trophy, Calendar, MapPin } from "lucide-react"

export default function PlayerProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<PlayerProfileDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<PlayerProfileDTO>>({})

  const { handleError } = useErrorHandler({ context: 'PlayerProfilePage' })
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const profileData = await playerService.getMyProfile()
        setProfile(profileData)
        setFormData(profileData)
      } catch (err) {
        handleError(err, 'Failed to load player profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [handleError])

  const handleInputChange = (field: keyof PlayerProfileDTO, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!profile || !formData) return

    try {
      setIsSaving(true)
      const updatedProfile = await playerService.updateMyProfile(formData)
      setProfile(updatedProfile)
      setFormData(updatedProfile)
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your player profile has been successfully updated",
      })
    } catch (err) {
      handleError(err, 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile || {})
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground mb-4">
              Unable to load your player profile. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your player information and preferences</p>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{profile.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{profile.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm font-medium mt-1 text-muted-foreground">
                    {user?.email || profile.email}
                    <Badge variant="secondary" className="ml-2">Cannot be changed</Badge>
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">{profile.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">
                      {profile.dateOfBirth 
                        ? new Date(profile.dateOfBirth).toLocaleDateString()
                        : 'Not provided'
                      }
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Golf Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Golf Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="handicap">Handicap</Label>
                  {isEditing ? (
                    <Input
                      id="handicap"
                      type="number"
                      step="0.1"
                      value={formData.handicap || ''}
                      onChange={(e) => handleInputChange('handicap', parseFloat(e.target.value) || 0)}
                      placeholder="Enter handicap"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">
                      {profile.handicap !== undefined ? profile.handicap.toFixed(1) : 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="homeClub">Home Club</Label>
                  {isEditing ? (
                    <Input
                      id="homeClub"
                      value={formData.homeClub || ''}
                      onChange={(e) => handleInputChange('homeClub', e.target.value)}
                      placeholder="Enter home club"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">{profile.homeClub || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="playingSince">Playing Since</Label>
                  {isEditing ? (
                    <Input
                      id="playingSince"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.playingSince || ''}
                      onChange={(e) => handleInputChange('playingSince', parseInt(e.target.value) || 0)}
                      placeholder="Year started playing"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">
                      {profile.playingSince || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="preferredTeeTime">Preferred Tee Time</Label>
                  {isEditing ? (
                    <Input
                      id="preferredTeeTime"
                      type="time"
                      value={formData.preferredTeeTime || ''}
                      onChange={(e) => handleInputChange('preferredTeeTime', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">
                      {profile.preferredTeeTime || 'No preference'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">
                    {profile.address || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes or preferences"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">
                    {profile.notes || 'No additional notes'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Member Since</Label>
                  <p className="font-medium mt-1">
                    {profile.createdAt 
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : 'Unknown'
                    }
                  </p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p className="font-medium mt-1">
                    {profile.updatedAt 
                      ? new Date(profile.updatedAt).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
