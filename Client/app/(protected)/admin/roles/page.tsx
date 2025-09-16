import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserManagement } from "@/components/admin/UserManagement"
import { ArrowLeft } from "lucide-react"

export default function RolesPage() {
  return (
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

      {/* Use the modern UserManagement component */}
      <UserManagement canManageUsers={true} />
    </div>
  )
}
