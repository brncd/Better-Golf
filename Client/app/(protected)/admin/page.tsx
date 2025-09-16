"use client"

import { AdminView } from "./AdminView"
import { useAuth } from "@/context/AuthContext"

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <AdminView user={user} />
  )
}
