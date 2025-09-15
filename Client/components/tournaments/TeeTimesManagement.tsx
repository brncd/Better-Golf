"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { useTeeTimes, useGenerateTeeTimes, useUpdateTeeTime } from "@/hooks/useTeeTimes";
import { TeeTimeDTO, TeeTimeUpdateDTO, TeeTimeGroup } from "@/types";
import { Clock, Users, Calendar, Settings, Play, Edit2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import type { SingleTournamentDTO } from '@/types';

interface TeeTimesManagementProps {
  tournament: SingleTournamentDTO;
  canManage: boolean;
}

export function TeeTimesManagement({ tournament, canManage }: TeeTimesManagementProps) {
  const { id: tournamentId, status: tournamentStatus, roundInfo } = tournament;
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [editingPlayer, setEditingPlayer] = useState<PlayerListGetDTO | null>(null);
  const [newTeeTime, setNewTeeTime] = useState<string>("");
  const [newStartingHole, setNewStartingHole] = useState<number>(1);

  const { toast } = useToast();
  const { data: teeTimes, isLoading, error } = useTeeTimes(tournamentId);
  const generateTeeTimesMutation = useGenerateTeeTimes();
  const updateTeeTimeMutation = useUpdateTeeTime();

  // Group tee times by round and then by time/hole
  const groupedTeeTimes = teeTimes?.reduce((acc, teeTime) => {
    if (!acc[teeTime.roundNumber]) {
      acc[teeTime.roundNumber] = {};
    }
    
    const key = `${teeTime.teeTime || '00:00:00'}-${teeTime.startingHole || 1}`;
    if (!acc[teeTime.roundNumber][key]) {
      acc[teeTime.roundNumber][key] = {
        teeTime: teeTime.teeTime || '00:00:00',
        startingHole: teeTime.startingHole || 1,
        players: []
      };
    }
    
    acc[teeTime.roundNumber][key].players.push(teeTime.player);
    return acc;
  }, {} as Record<number, Record<string, TeeTimeGroup>>) || {};

  const currentRoundTeeTimes = groupedTeeTimes[selectedRound] || {};
  const rounds = Object.keys(groupedTeeTimes).map(Number).sort();

  const handleGenerateTeeTimes = async () => {
    try {
      await generateTeeTimesMutation.mutateAsync(tournamentId);
    } catch (error) {
      console.error('Error generating tee times:', error);
    }
  };

  const handleUpdateTeeTime = async () => {
    if (!editingPlayer || !newTeeTime) return;

    const roundForUpdate = tournament.rounds.find(r => r.roundNumber === selectedRound);
    if (!roundForUpdate) {
      toast({ title: "Error", description: "Could not find the selected round.", variant: "destructive" });
      return;
    }

    const update: TeeTimeUpdateDTO = {
      teeTime: newTeeTime,
      startingHole: newStartingHole,
    };

    updateTeeTimeMutation.mutate({
      tournamentId,
      roundId: roundForUpdate.id,
      playerId: editingPlayer.id,
      update,
    }, {
      onSuccess: () => {
        setEditingPlayer(null);
        setNewTeeTime("");
        setNewStartingHole(1);
      }
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const canGenerateTeeTimes = canManage && (tournamentStatus === 'OpenRegistration' || tournamentStatus === 'InProgress');
  const hasTeeTimes = teeTimes && teeTimes.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Failed to load tee times</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tee Times Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage tournament tee times and player assignments
              </p>
            </div>
            {canGenerateTeeTimes && (
              <Button
                onClick={handleGenerateTeeTimes}
                disabled={generateTeeTimesMutation.isPending}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {hasTeeTimes ? 'Regenerate' : 'Generate'} Tee Times
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {!hasTeeTimes ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Tee Times Generated</h3>
              <p className="text-muted-foreground mb-4">
                Generate tee times to organize player start times and groups
              </p>
              {canGenerateTeeTimes && (
                <Button
                  onClick={handleGenerateTeeTimes}
                  disabled={generateTeeTimesMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Generate Tee Times
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Round Selection */}
          {rounds.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Round</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {rounds.map((round) => (
                    <Button
                      key={round}
                      variant={selectedRound === round ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRound(round)}
                    >
                      Round {round}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tee Times Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Round {selectedRound} Tee Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(currentRoundTeeTimes).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tee times for this round</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(currentRoundTeeTimes)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, group]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(group.teeTime)}
                            </Badge>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Hole {group.startingHole}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {group.players.length} player{group.players.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.players.map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-primary">
                                    {player.firstName?.[0]}{player.lastName?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {player.firstName} {player.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Handicap: {player.handicap || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              {canManage && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const teeTime = teeTimes?.find(tt => tt.player.id === player.id && tt.roundNumber === selectedRound);
                                        if (teeTime) {
                                          setEditingPlayer(player);
                                          setNewTeeTime(teeTime.teeTime || '');
                                          setNewStartingHole(teeTime.startingHole || 1);
                                        }
                                      }}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Tee Time</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="teeTime">Tee Time</Label>
                                        <Input
                                          id="teeTime"
                                          type="time"
                                          value={newTeeTime.substring(0, 5)} // Remove seconds for input
                                          onChange={(e) => setNewTeeTime(e.target.value + ':00')}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="startingHole">Starting Hole</Label>
                                        <Select
                                          value={newStartingHole.toString()}
                                          onValueChange={(value) => setNewStartingHole(parseInt(value))}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Array.from({ length: 18 }, (_, i) => (
                                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                Hole {i + 1}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditingPlayer(null)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={handleUpdateTeeTime}
                                          disabled={updateTeeTimeMutation.isPending}
                                        >
                                          Update
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
