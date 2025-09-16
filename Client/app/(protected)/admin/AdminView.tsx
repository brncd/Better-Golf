"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Users, Tag, Shield, Eye } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { useAuth } from "@/context/AuthContext"
import { User, CategoryListGetDTO } from "@/types"

interface AdminViewProps {
  user?: User | null;
}

export function AdminView({ user }: AdminViewProps) {
  const { data: categoriesResponse, isLoading } = useCategories()
  const categories = categoriesResponse?.items || []

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Administration</h1>
          <p className="text-muted-foreground">Manage system settings, categories, and user roles</p>
        </div>

        {/* Admin Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Tag className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">User Roles</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">System</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Category Management
              </CardTitle>
              <Button asChild size="sm">
                <Link href="/admin/categories">
                  <Eye className="h-4 w-4 mr-2" />
                  Manage
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create and manage player categories for tournaments and competitions.
              </p>
              <div className="space-y-2">
                {categories.slice(0, 3).map((category: CategoryListGetDTO) => (
                  <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.handicapMin !== undefined && category.handicapMax !== undefined
                        ? `${category.handicapMin}-${category.handicapMax} HCP`
                        : category.gender
                          ? category.gender
                          : "All"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Role Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Management
              </CardTitle>
              <Button asChild size="sm">
                <Link href="/admin/roles">
                  <Eye className="h-4 w-4 mr-2" />
                  Manage
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Assign and manage user roles and permissions within the system.
              </p>
              <div className="space-y-2">
                <div className="text-center py-4 text-muted-foreground">
                  <p>Role management functionality coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Tournament Settings</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure default tournament parameters and scoring rules.
                </p>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Notification Settings</h3>
                <p className="text-sm text-muted-foreground mb-3">Manage email notifications and system alerts.</p>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Backup & Export</h3>
                <p className="text-sm text-muted-foreground mb-3">Export data and manage system backups.</p>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
