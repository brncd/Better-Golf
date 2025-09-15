"use client"

import { MainLayout } from "@/components/layouts/MainLayout"
import { ProfileView } from "./ProfileView"
import { useAuth } from "@/context/AuthContext"

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <MainLayout user={user}>
      <ProfileView />
    </MainLayout>
  )
}