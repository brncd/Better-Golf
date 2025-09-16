import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { Plus } from "lucide-react"
import { CoursesView } from "./CoursesView"
import { courseService } from "@/lib/services"
import { ClientOnly } from "@/components/atoms/ClientOnly"

async function getCoursesData() {
  // Only fetch data if we're in a runtime environment with API access
  if (process.env.NODE_ENV === 'production' && !process.env.API_URL) {
    return []
  }
  
  try {
    const coursesResponse = await courseService.getAll({ pageNumber: 1, pageSize: 50 })
    return coursesResponse.items || []
  } catch (error) {
    // Gracefully handle API unavailability during build
    console.warn('API not available during build, using empty initial data')
    return []
  }
}

export default async function CoursesPage() {
  const initialCourses = await getCoursesData()

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Golf Courses</h1>
            <p className="text-muted-foreground">Manage golf courses and their hole configurations</p>
          </div>
          <ClientOnly>
            <RoleGuard roles={['Admin', 'TournamentOrganizer']}>
              <Button asChild>
                <Link href="/courses/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Link>
              </Button>
            </RoleGuard>
          </ClientOnly>
        </div>

        {/* Content */}
        <CoursesView initialCourses={initialCourses} />
      </div>
  )
}