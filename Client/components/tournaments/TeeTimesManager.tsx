'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Users, MapPin, Plus, Trash2, Edit } from 'lucide-react';
import { useTeeTimes, useGenerateTeeTimes, useAssignPlayerToTeeTime, useRemovePlayerFromTeeTime } from '@/hooks/useTeeTimes';
import { usePlayers } from '@/hooks/usePlayers';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { ErrorDisplay } from '@/components/atoms/ErrorDisplay';
import type { TeeTime, TeeTimePlayer } from '@/types/teeTime';

interface TeeTimesManagerProps {
  tournamentId: string;
  canEdit?: boolean;
}

export function TeeTimesManager({ tournamentId, canEdit = false }: TeeTimesManagerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null);

  const { data: teeTimes, isLoading, error } = useTeeTimes(tournamentId);
  const { data: playersData } = usePlayers();
  const generateTeeTimesMutation = useGenerateTeeTimes();
  const assignPlayerMutation = useAssignPlayerToTeeTime();
  const removePlayerMutation = useRemovePlayerFromTeeTime();

  const players = (playersData as any)?.items || [];

  const handleGenerateTeeTimes = () => {
    generateTeeTimesMutation.mutate(tournamentId);
    setShowGenerateDialog(false);
  };

  const handleAssignPlayer = (playerId: string, position: number) => {
    if (!selectedTeeTime) return;
    
    // For now, we'll use mock data since the API structure needs to be aligned
    // This would need the actual round ID and proper tee time format
    const mockRoundId = 1;
    const mockTeeTime = selectedTeeTime.teeTimeSlot;
    
    assignPlayerMutation.mutate({
      roundId: mockRoundId,
      playerId: parseInt(playerId),
      teeTime: mockTeeTime,
      startingHole: selectedTeeTime.holeNumber,
    });
    setShowAssignDialog(false);
  };

  const handleRemovePlayer = (teeTimeId: string, playerId: string) => {
    removePlayerMutation.mutate({ teeTimeId, playerId });
  };

  const getStatusColor = (status: TeeTime['status']) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Booked': return 'bg-blue-100 text-blue-800';
      case 'InProgress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  const filteredTeeTimes = teeTimes?.filter((teeTime: TeeTime) => {
    const teeTimeDate = new Date(teeTime.teeTimeSlot).toISOString().split('T')[0];
    return teeTimeDate === selectedDate && teeTime.roundNumber === selectedRound;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 items-center">
          <div>
            <Label htmlFor="date-select">Date</Label>
            <Input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div>
            <Label htmlFor="round-select">Round</Label>
            <Select value={selectedRound.toString()} onValueChange={(value) => setSelectedRound(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Round 1</SelectItem>
                <SelectItem value="2">Round 2</SelectItem>
                <SelectItem value="3">Round 3</SelectItem>
                <SelectItem value="4">Round 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {canEdit && (
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Generate Tee Times
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Tee Times</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This will automatically generate tee times for all registered players based on the tournament configuration.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleGenerateTeeTimes}
                    disabled={generateTeeTimesMutation.isPending}
                  >
                    {generateTeeTimesMutation.isPending ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tee Times Grid */}
      {filteredTeeTimes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tee Times Scheduled</h3>
            <p className="text-muted-foreground text-center mb-4">
              No tee times have been scheduled for {selectedDate}, Round {selectedRound}.
            </p>
            {canEdit && (
              <Button onClick={() => setShowGenerateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Tee Times
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeeTimes.map((teeTime: TeeTime) => (
            <Card key={teeTime.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatTime(teeTime.teeTimeSlot)}
                  </CardTitle>
                  <Badge className={getStatusColor(teeTime.status)}>
                    {teeTime.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {teeTime.courseName} - Hole {teeTime.holeNumber}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Players ({teeTime.players.length}/{teeTime.maxPlayers})
                    </span>
                    {canEdit && teeTime.players.length < teeTime.maxPlayers && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTeeTime(teeTime);
                          setShowAssignDialog(true);
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {teeTime.players.map((player: TeeTimePlayer) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div>
                          <div className="font-medium text-sm">{player.playerName}</div>
                          <div className="text-xs text-muted-foreground">
                            Position {player.position}
                            {player.handicap && ` • HCP: ${player.handicap}`}
                          </div>
                        </div>
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemovePlayer(teeTime.id, player.playerId)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {teeTime.players.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No players assigned
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Player Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Player to Tee Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTeeTime && (
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium">
                  {formatTime(selectedTeeTime.teeTimeSlot)} - {selectedTeeTime.courseName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedTeeTime.players.length}/{selectedTeeTime.maxPlayers} players assigned
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Available Players</Label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {players.map((player: any) => {
                  const isAssigned = selectedTeeTime?.players.some(p => p.playerId === player.id);
                  const nextPosition = (selectedTeeTime?.players.length || 0) + 1;
                  
                  return (
                    <div
                      key={player.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-muted ${
                        isAssigned ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => !isAssigned && handleAssignPlayer(player.id, nextPosition)}
                    >
                      <div className="font-medium">{player.firstName} {player.lastName}</div>
                      <div className="text-sm text-muted-foreground">
                        {player.handicap && `HCP: ${player.handicap}`}
                        {isAssigned && ' • Already assigned'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
