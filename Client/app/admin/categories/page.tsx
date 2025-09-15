"use client"

import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CategoriesView } from "./CategoriesView"
import { useAuth } from "@/context/AuthContext"

export default function CategoriesPage() {
  const { user } = useAuth();

  return (
    <MainLayout user={user}>
      <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
              </Link>
          </Button>
      </div>
      <CategoriesView />
    </MainLayout>
  )
}