"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CategoryForm } from "@/components/organisms/CategoryForm"
import { apiClient } from "@/lib/apiService"
import { CategoryListGetDTO, PaginationResponse, CategoryPostDTO } from "@/types"
import { ArrowLeft, Plus, Edit, Trash2, Tag } from "lucide-react"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryListGetDTO[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryListGetDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get<PaginationResponse<CategoryListGetDTO>>("/Categories")
        setCategories(response.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])


  const handleCreateCategory = async (data: CategoryPostDTO) => {
    //... Phase 3
  }

  const handleEditCategory = async (data: CategoryPostDTO) => {
    //... Phase 3
  }

  const handleDeleteCategory = (id: number) => {
    console.log("Deleting category:", id)
  }
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          <p>Error loading categories: {error}</p>
        </div>
      )
    }

    if (categories.length === 0) {
      return (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No categories created</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first category</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Category
          </Button>
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Player Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-sm capitalize">{category.sex}</TableCell>
                <TableCell className="text-sm">{category.count}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingCategory(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Category Management</h1>
            <p className="text-muted-foreground">Create and manage player categories for tournaments</p>
          </div>

          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <CategoryForm onSubmit={handleCreateCategory} onCancel={() => setShowForm(false)} isLoading={isLoading} />
        )}

        {editingCategory && (
          <CategoryForm
            initialData={editingCategory as any}
            onSubmit={handleEditCategory}
            onCancel={() => setEditingCategory(null)}
            isLoading={isLoading}
          />
        )}

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categories ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

