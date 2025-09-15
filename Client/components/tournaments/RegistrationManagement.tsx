"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { ErrorDisplay } from "@/components/atoms/ErrorDisplay"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog"
import { useTournamentPlayers, useAddPlayerToTournament, useRemovePlayerFromTournament } from "@/hooks/useTournaments"
import { usePlayers } from "@/hooks/usePlayers"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  Filter,
  Mail,
  Phone,
  Trophy,
  Settings
} from "lucide-react"
import type { PlayerListGetDTO } from "@/types"

interface RegistrationManagementProps {
  tournamentId: number
  tournamentStatus: string
  canManage: boolean
}

export function RegistrationManagement({ 
  tournamentId, 
  tournamentStatus, 
  canManage 
}: RegistrationManagementProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false)
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState<number | null>(null)
  const [playerToRemove, setPlayerToRemove] = useState<PlayerListGetDTO | null>(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)

  // Data fetching
  const { data: registeredPlayersResponse, isLoading: playersLoading, error: playersError } = useTournamentPlayers(tournamentId)
  const { data: allPlayersResponse, isLoading: allPlayersLoading } = usePlayers({ pageNumber: 1, pageSize: 100 })
  
  // Mutations
  const addPlayerMutation = useAddPlayerToTournament()
  const removePlayerMutation = useRemovePlayerFromTournament()

  const registeredPlayers = (registeredPlayersResponse as any)?.items || []
  const allPlayers = (allPlayersResponse as any)?.items || []

  // Filter available players (not already registered)
  const availablePlayers = allPlayers.filter((player: PlayerListGetDTO) => 
    !registeredPlayers.some((registered: PlayerListGetDTO) => registered.id === player.id)
  )

  // Filter registered players based on search and category
  const filteredRegisteredPlayers = registeredPlayers.filter((player: PlayerListGetDTO) => {
    const matchesSearch = !searchTerm || 
      `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || 
      player.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  const handleAddPlayer = async () => {
    if (!selectedPlayerToAdd) return
    
    try {
      await addPlayerMutation.mutateAsync({
        tournamentId,
        playerId: selectedPlayerToAdd
      })
      
      toast({
        title: "Player Added",
        description: "Player has been successfully added to the tournament.",
      })
      
      setShowAddPlayerDialog(false)
      setSelectedPlayerToAdd(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add player to tournament. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemovePlayer = async () => {
    if (!playerToRemove) return
    
    try {
      await removePlayerMutation.mutateAsync({
        tournamentId,
        playerId: playerToRemove.id
      })
      
      toast({
        title: "Player Removed",
        description: `${playerToRemove.firstName} ${playerToRemove.lastName} has been removed from the tournament.`,
      })
      
      setShowRemoveDialog(false)
      setPlayerToRemove(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove player from tournament. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openRemoveDialog = (player: PlayerListGetDTO) => {
    setPlayerToRemove(player)
    setShowRemoveDialog(true)
  }

  const canModifyRegistrations = canManage && (tournamentStatus === 'Draft' || tournamentStatus === 'OpenRegistration')

  if (playersLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (playersError) {
    return <ErrorDisplay error={playersError} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Registered</p>
                <p className="text-2xl font-bold">{registeredPlayers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Available Players</p>
                <p className="text-2xl font-bold">{availablePlayers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Registration Status</p>
                <Badge variant={tournamentStatus === 'OpenRegistration' ? 'default' : 'secondary'}>
                  {tournamentStatus === 'OpenRegistration' ? 'Open' : 'Closed'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search players by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="amateur">Amateur</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canModifyRegistrations && (
          <Dialog open={showAddPlayerDialog} onOpenChange={setShowAddPlayerDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Player to Tournament</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="player-select">Select Player</Label>
                  <Select 
                    value={selectedPlayerToAdd?.toString() || ""} 
                    onValueChange={(value) => setSelectedPlayerToAdd(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a player to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayers.map((player: PlayerListGetDTO) => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          {player.firstName} {player.lastName} - {player.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddPlayerDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddPlayer}
                    disabled={!selectedPlayerToAdd || addPlayerMutation.isPending}
                  >
                    {addPlayerMutation.isPending ? "Adding..." : "Add Player"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Players ({filteredRegisteredPlayers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRegisteredPlayers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No players found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRegisteredPlayers.map((player: PlayerListGetDTO) => (
                <Card key={player.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {player.firstName?.[0] || '?'}
                            {player.lastName?.[0] || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {player.firstName} {player.lastName}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{player.email}</span>
                          </div>
                          {(player as any).phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{(player as any).phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Handicap: {player.handicap || 'N/A'}
                            </Badge>
                            {player.categoryName && (
                              <Badge variant="secondary" className="text-xs">
                                {player.categoryName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {canModifyRegistrations && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRemoveDialog(player)}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Player Confirmation Dialog */}
      <ConfirmDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="Remove Player"
        description={`Are you sure you want to remove ${playerToRemove?.firstName} ${playerToRemove?.lastName} from this tournament? This action cannot be undone.`}
        confirmLabel="Remove Player"
        cancelLabel="Cancel"
        onConfirm={handleRemovePlayer}
        variant="destructive"
      />
    </div>
  )
}
