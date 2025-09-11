"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { tournamentService } from "@/lib/services"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { useToast } from "@/hooks/use-toast"
import { SingleTournamentDTO, TeeTimeDTO, TeeTimePlayerDTO, PlayerListGetDTO } from "@/types"
import { ArrowLeft, Clock, Users, Calendar, Plus, Shuffle, Download } from "lucide-react"

export default function TeeTimesPage() {
  const params = useParams()
  const tournamentId = params.id as string

  const [tournament, setTournament] = useState<SingleTournamentDTO | null>(null)
  const [teeTimes, setTeeTimes] = useState<TeeTimeDTO[]>([])
  const [players, setPlayers] = useState<PlayerListGetDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  const { handleError } = useErrorHandler({ context: 'TeeTimesPage' })
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [tournamentData, playersData] = await Promise.all([
          tournamentService.getById(tournamentId),
          tournamentService.getPlayers(tournamentId, { pageSize: 100 })
        ])

        setTournament(tournamentData)
        setPlayers(playersData.items)

        // Try to fetch existing tee times
        try {
          const teeTimesData = await tournamentService.getTeeTimes(tournamentId)
          setTeeTimes(teeTimesData)
        } catch (err) {
          // No tee times generated yet
          setTeeTimes([])
        }
      } catch (err) {
        handleError(err, 'Failed to load tournament data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tournamentId, handleError])

  const handleGenerateTeeTimes = async () => {
    try {
      setIsGenerating(true)
      const generatedTeeTimes = await tournamentService.generateTeeTimes(tournamentId)
      setTeeTimes(generatedTeeTimes)
      setShowGenerateDialog(false)
      toast({
        title: "Tee times generated",
        description: `Generated ${generatedTeeTimes.length} tee time slots for ${players.length} players`,
      })
    } catch (err) {
      handleError(err, 'Failed to generate tee times')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatTeeTime = (teeTime: string | Date) => {
    const date = typeof teeTime === 'string' ? new Date(teeTime) : teeTime
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const exportTeeTimes = () => {
    if (!tournament || teeTimes.length === 0) return

    const csvContent = [
      ['Tee Time', 'Starting Hole', 'Players'].join(','),
      ...teeTimes.map(teeTime => [
        teeTime.teeTime ? formatTeeTime(teeTime.teeTime) : 'TBD',
        teeTime.startingHole || 1,
        teeTime.players?.map((p: TeeTimePlayerDTO) => p.name).join(' | ') || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tournament.name}-tee-times.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Tee times exported",
      description: "CSV file has been downloaded",
    })
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (!tournament) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <Button asChild>
            <Link href="/tournaments">Back to Tournaments</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/tournaments/${tournament.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tournament
            </Link>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tee Times</h1>
            <p className="text-muted-foreground">{tournament.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(tournament.startDate.toString())}
            </p>
          </div>

          <div className="flex gap-2">
            {teeTimes.length > 0 && (
              <Button variant="outline" onClick={exportTeeTimes}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
            
            <RoleGuard roles={['Admin', 'TournamentOrganizer']}>
              <Button 
                onClick={() => setShowGenerateDialog(true)}
                disabled={isGenerating}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                {teeTimes.length > 0 ? 'Regenerate' : 'Generate'} Tee Times
              </Button>
            </RoleGuard>
          </div>
        </div>

        {/* Tournament Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{players.length}</div>
                <div className="text-sm text-muted-foreground">Registered Players</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{teeTimes.length}</div>
                <div className="text-sm text-muted-foreground">Tee Time Slots</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {teeTimes.reduce((total, teeTime) => total + (teeTime.players?.length || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Players Assigned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tee Times Table */}
        {teeTimes.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tournament Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tee Time</TableHead>
                    <TableHead>Starting Hole</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Group Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teeTimes.map((teeTime, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {teeTime.teeTime ? formatTeeTime(teeTime.teeTime) : 'TBD'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Hole {teeTime.startingHole || 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {teeTime.players?.map((player: TeeTimePlayerDTO, playerIndex: number) => (
                            <div key={playerIndex} className="text-sm">
                              {player.name}
                            </div>
                          )) || <span className="text-muted-foreground">No players assigned</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          (teeTime.players?.length || 0) === 4 ? "default" :
                          (teeTime.players?.length || 0) >= 2 ? "secondary" :
                          "destructive"
                        }>
                          {teeTime.players?.length || 0}/4
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Tee Times Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Generate tee times to organize player groups and starting times for the tournament.
                </p>
                <RoleGuard roles={['Admin', 'TournamentOrganizer']}>
                  <Button onClick={() => setShowGenerateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Tee Times
                  </Button>
                </RoleGuard>
              </div>
            </CardContent>
          </Card>
        )}

        <ConfirmDialog
          open={showGenerateDialog}
          onOpenChange={setShowGenerateDialog}
          title={teeTimes.length > 0 ? "Regenerate Tee Times" : "Generate Tee Times"}
          description={
            teeTimes.length > 0 
              ? "This will replace the existing tee times. Are you sure you want to continue?"
              : `This will automatically generate tee times for ${players.length} registered players. Continue?`
          }
          onConfirm={handleGenerateTeeTimes}
        />
      </div>
    </MainLayout>
  )
}
