"use client"

import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { Plus } from "lucide-react"
import { CoursesView } from "./CoursesView"

export default function CoursesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Golf Courses</h1>
            <p className="text-muted-foreground">Manage golf courses and their hole configurations</p>
          </div>
          <RoleGuard roles={['Admin', 'TournamentOrganizer']}>
            <Button asChild>
              <Link href="/courses/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Link>
            </Button>
          </RoleGuard>
        </div>

        {/* Content */}
        <CoursesView />
      </div>
    </MainLayout>
  )
}