"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CategoriesView } from "./CategoriesView"

export default function CategoriesPage() {
  return (
    <>
      <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
              </Link>
          </Button>
      </div>
      <CategoriesView />
    </>
  )
}
