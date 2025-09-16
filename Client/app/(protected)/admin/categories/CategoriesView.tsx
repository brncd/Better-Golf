"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CategoryForm } from "@/components/organisms/CategoryForm"
import { CategoryListGetDTO, CategoryPostDTO, SingleCategoryDTO } from "@/types"
import { Plus, Edit, Trash2, Tag } from "lucide-react"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ErrorDisplay } from "@/components/atoms/ErrorDisplay"
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useCategory } from "@/hooks/useCategories"

export function CategoriesView() {
  const [showForm, setShowForm] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null)
  
  // TanStack Query hooks
  const { data: categoriesData, isLoading, error, refetch } = useCategories({ pageNumber: 1, pageSize: 100 })
  const { data: editingCategory, isLoading: isLoadingCategory } = useCategory(editingCategoryId!)
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()
  
  const categories = categoriesData?.items || []

  const handleCreateCategory = async (data: CategoryPostDTO) => {
    await createCategoryMutation.mutateAsync(data)
    setShowForm(false)
  }

  const handleEditCategory = async (data: CategoryPostDTO) => {
    if (!editingCategoryId) return
    await updateCategoryMutation.mutateAsync({ id: editingCategoryId, data })
    setEditingCategoryId(null)
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategoryId) return
    await deleteCategoryMutation.mutateAsync(deletingCategoryId)
    setDeletingCategoryId(null)
  }
  
  const openEditForm = (category: CategoryListGetDTO) => {
    setEditingCategoryId(category.id)
    setShowForm(false)
  }
  
  const isAnyLoading = isLoading || createCategoryMutation.isPending || updateCategoryMutation.isPending || deleteCategoryMutation.isPending || isLoadingCategory

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />
    }
    
    if (error) {
      return <ErrorDisplay error={error} onRetry={refetch} />
    }
    
    if (categories.length === 0 && !showForm && !editingCategoryId) {
      return (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No categories created</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first category</p>
          <Button onClick={() => { setShowForm(true); setEditingCategoryId(null); }}>
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
                <TableCell className="text-sm capitalize">{category.gender}</TableCell>
                <TableCell className="text-sm">-</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditForm(category)} disabled={isAnyLoading}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingCategoryId(category.id)} disabled={isAnyLoading}>
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
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Category Management</h1>
            <p className="text-muted-foreground">Create and manage player categories for tournaments</p>
          </div>

          <Button onClick={() => { setShowForm(true); setEditingCategoryId(null); }} disabled={isAnyLoading}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <CategoryForm 
            onSubmit={handleCreateCategory} 
            onCancel={() => setShowForm(false)} 
            isLoading={createCategoryMutation.isPending} 
          />
        )}

        {editingCategoryId && editingCategory && (
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleEditCategory}
            onCancel={() => setEditingCategoryId(null)}
            isLoading={updateCategoryMutation.isPending}
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
        
        <ConfirmDialog
          open={deletingCategoryId !== null}
          onOpenChange={(isOpen) => !isOpen && setDeletingCategoryId(null)}
          title="Are you sure?"
          description="This action cannot be undone. This will permanently delete the category."
          onConfirm={handleDeleteCategory}
          variant="destructive"
        />
      </div>
  )
}
