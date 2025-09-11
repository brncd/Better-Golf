"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HandicapBadge } from "@/components/atoms/HandicapBadge"
import { usePlayer } from "@/hooks/usePlayers"
import { SinglePlayerDTO } from "@/types"
import { ArrowLeft, Edit, Calendar, Trophy, Target, Award } from "lucide-react"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"

export default function PlayerDetailPage() {
  const params = useParams()
  const playerId = params.id as string

  // Use TanStack Query for data fetching with caching
  const { data: player, isLoading, error } = usePlayer(playerId)

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (name: string, lastName: string) => {
    return `${name[0]}${lastName[0]}`.toUpperCase()
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (isLoading) {
    return <MainLayout><LoadingSpinner /></MainLayout>
  }

  if (error) {
    return <MainLayout><div>Error: {error instanceof Error ? error.message : 'An error occurred'}</div></MainLayout>
  }

  if (!player) {
    return <MainLayout><div>Player not found</div></MainLayout>
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/players">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Players
            </Link>
          </Button>
        </div>

        {/* Player Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={`/abstract-geometric-shapes.png?height=96&width=96&query=${(player as any).name}+${(player as any).lastName}`}
              />
              <AvatarFallback className="text-2xl">{getInitials((player as any).name, (player as any).lastName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-balance">
                {(player as any).name} {(player as any).lastName}
              </h1>
              <div className="flex items-center gap-3">
                <HandicapBadge handicap={(player as any).handicapIndex} />
              </div>
            </div>
          </div>

          <Button asChild>
            <Link href={`/players/${(player as any).id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Player
            </Link>
          </Button>
        </div>

        {/* Player Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Handicap</p>
                  <p className="text-xl font-bold">{(player as any).handicapIndex.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Matricula</p>
                  <p className="text-xl font-bold">{(player as any).matriculaAUG || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-xl font-bold">{calculateAge((player as any).birthdate) || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(player as any).birthdate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{formatDate((player as any).birthdate)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Golf Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Handicap</p>
                <p className="text-2xl font-bold">{(player as any).handicapIndex.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preferred Category</p>
                <p className="font-medium capitalize">{(player as any).isPreferredCategoryLadies ? "Ladies" : "Open"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournament History Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tournament history will be displayed here once the player participates in tournaments</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
