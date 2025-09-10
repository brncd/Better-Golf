"use client"

import { useState } from "react"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleBadge } from "@/components/atoms/RoleBadge"
import { mockRoleAssignments } from "@/data/mockData"
import type { RoleAssignmentDTO } from "@/types"
import { ArrowLeft, Shield, Users } from "lucide-react"

export default function RolesPage() {
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignmentDTO[]>(mockRoleAssignments)

  const handleRoleChange = (userId: string, newRole: RoleAssignmentDTO["role"]) => {
    // In real app, this would call API to update role
    console.log("Updating role:", { userId, newRole })

    setRoleAssignments((prev) =>
      prev.map((assignment) =>
        assignment.userId === userId
          ? { ...assignment, role: newRole, assignedAt: new Date().toISOString() }
          : assignment,
      ),
    )
  }

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.substring(0, 2)
  }

  const roleStats = {
    admin: roleAssignments.filter((r) => r.role === "admin").length,
    "tournament-director": roleAssignments.filter((r) => r.role === "tournament-director").length,
    player: roleAssignments.filter((r) => r.role === "player").length,
    viewer: roleAssignments.filter((r) => r.role === "viewer").length,
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

        <div>
          <h1 className="text-3xl font-bold text-balance">Role Management</h1>
          <p className="text-muted-foreground">Assign and manage user roles and permissions</p>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">{roleStats.admin}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Tournament Directors</p>
                  <p className="text-2xl font-bold">{roleStats["tournament-director"]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Players</p>
                  <p className="text-2xl font-bold">{roleStats.player}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Viewers</p>
                  <p className="text-2xl font-bold">{roleStats.viewer}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Role Assignments ({roleAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead className="text-right">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleAssignments.map((assignment) => (
                    <TableRow key={assignment.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`/abstract-geometric-shapes.png?key=roles&height=32&width=32&query=${assignment.userName}`}
                            />
                            <AvatarFallback className="text-xs">{getInitials(assignment.userName)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{assignment.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{assignment.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={assignment.role} />
                      </TableCell>
                      <TableCell className="text-sm">{new Date(assignment.assignedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm capitalize">{assignment.assignedBy}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={assignment.role}
                          onValueChange={(value: RoleAssignmentDTO["role"]) =>
                            handleRoleChange(assignment.userId, value)
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="tournament-director">Tournament Director</SelectItem>
                            <SelectItem value="player">Player</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Role Descriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Role Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RoleBadge role="admin" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Full system access including user management, tournament creation, and system configuration.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RoleBadge role="tournament-director" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Can create and manage tournaments, enter scores, and manage player registrations.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RoleBadge role="player" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Can view tournaments, register for events, and view their own scores and statistics.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RoleBadge role="viewer" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Read-only access to view tournaments, leaderboards, and public information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
