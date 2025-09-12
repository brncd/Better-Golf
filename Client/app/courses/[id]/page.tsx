"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HoleCard } from "@/components/molecules/HoleCard"
import { HoleForm } from "@/components/organisms/HoleForm"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ErrorDisplay } from "@/components/atoms/ErrorDisplay"
import { useCourse, useCourseHoles, useAddHole, useRemoveHole } from "@/hooks/useCourses"
import { RoleGuard } from "@/components/auth/RoleGuard"
import type { HoleListGetDTO, HolePostDTO } from "@/types"
import { ArrowLeft, Edit, MapPin, Flag, Ruler, Plus, Target } from "lucide-react"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string

  const [showHoleForm, setShowHoleForm] = useState(false)
  const [editingHole, setEditingHole] = useState<HoleListGetDTO | null>(null)

  // Use TanStack Query for data fetching with caching
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId)
  const { data: holesResponse, isLoading: holesLoading, error: holesError } = useCourseHoles(courseId)
  const addHoleMutation = useAddHole()
  const removeHoleMutation = useRemoveHole()

  const holes = holesResponse?.items || []
  const isLoading = courseLoading || holesLoading
  const error = courseError || holesError

  const handleAddHole = (data: HolePostDTO) => {
    addHoleMutation.mutate({ courseId, data });
    setShowHoleForm(false);
  }

  const handleEditHole = (data: HolePostDTO) => {
    if (!editingHole) return;
    // For now, just close the form - hole editing API would need to be implemented
    console.log("Editing hole:", data);
    setEditingHole(null);
  }

  const handleDeleteHole = (id: string | number) => {
    if (confirm("Are you sure you want to delete this hole?")) {
      removeHoleMutation.mutate({ courseId, holeId: id.toString() });
    }
  }

  const totalPar = holes.reduce((sum, hole) => sum + hole.par, 0)
  const totalYardage = holes.reduce((sum, hole) => sum + hole.yardage, 0)

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-red-500">
          <p>Error loading course: {error instanceof Error ? error.message : 'Server error. Please try again later.'}</p>
          <Button asChild className="mt-4">
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Course not found</p>
          <Button asChild className="mt-4">
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      </MainLayout>
    )
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

        {/* Course Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">{course.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{course.location}</span>
            </div>
            {course.description && <p className="text-muted-foreground max-w-2xl">{course.description}</p>}
          </div>

          <RoleGuard roles={["Admin", "TournamentOrganizer"]}>
            <Button asChild>
              <Link href={`/courses/${course.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Course
              </Link>
            </Button>
          </RoleGuard>
        </div>

        {/* Course Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Flag className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Holes</p>
                  <p className="text-xl font-bold">{course.numberOfHoles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Par</p>
                  <p className="text-xl font-bold">{totalPar || course.par}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Ruler className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Yardage</p>
                  <p className="text-xl font-bold">
                    {totalYardage.toLocaleString() || course.yardage.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-xl font-bold">{course.rating || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="holes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="holes">Holes ({holes.length})</TabsTrigger>
            <TabsTrigger value="details">Course Details</TabsTrigger>
          </TabsList>

          <TabsContent value="holes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Course Layout</h3>
              <Button onClick={() => setShowHoleForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Hole
              </Button>
            </div>

            {showHoleForm && (
              <HoleForm courseId={course.id.toString()} onSubmit={handleAddHole} onCancel={() => setShowHoleForm(false)} />
            )}

            {editingHole && (
              <HoleForm
                courseId={course.id.toString()}
                initialData={editingHole}
                onSubmit={handleEditHole}
                onCancel={() => setEditingHole(null)}
              />
            )}

            {holes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {holes.map((hole) => (
                  <HoleCard key={hole.id} hole={hole} onEdit={setEditingHole} onDelete={handleDeleteHole} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No holes configured</h3>
                <p className="text-muted-foreground mb-4">Start by adding holes to this course</p>
                <Button onClick={() => setShowHoleForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Hole
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Course Name</p>
                    <p className="text-sm">{course.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-sm">{course.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Number of Holes</p>
                    <p className="text-sm">{course.numberOfHoles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Par</p>
                    <p className="text-sm">{course.par}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Yardage</p>
                    <p className="text-sm">{course.yardage.toLocaleString()} yards</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Course Rating</p>
                    <p className="text-sm">{course.rating || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Slope Rating</p>
                    <p className="text-sm">{course.slope || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-sm">{course.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>

                {course.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm">{course.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
