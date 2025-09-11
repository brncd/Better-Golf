'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Trophy, Users, Calendar, Plus, Play, Crown, Target } from 'lucide-react';
import { useMatchPlayBracket, useCreateMatchPlayBracket, useUpdateMatch, useAdvanceRound } from '@/hooks/useMatchPlay';
import { useTournamentPlayers } from '@/hooks/useTournaments';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { ErrorDisplay } from '@/components/atoms/ErrorDisplay';
import type { MatchPlayBracket, Match, BracketSetup, MatchPlayer } from '@/types/matchPlay';

interface MatchPlayBracketProps {
  tournamentId: string;
  canEdit?: boolean;
}

export function MatchPlayBracket({ tournamentId, canEdit = false }: MatchPlayBracketProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [bracketSetup, setBracketSetup] = useState<Partial<BracketSetup>>({
    name: '',
    seedingMethod: 'Handicap',
    byeHandling: 'LowestSeed',
  });

  const { data: bracket, isLoading, error } = useMatchPlayBracket(tournamentId);
  const { data: playersData } = useTournamentPlayers(tournamentId);
  const createBracketMutation = useCreateMatchPlayBracket();
  const updateMatchMutation = useUpdateMatch();
  const advanceRoundMutation = useAdvanceRound();

  const players = (playersData as any)?.items || [];

  const handleCreateBracket = () => {
    if (!bracketSetup.name || !bracketSetup.players?.length) return;

    createBracketMutation.mutate({
      tournamentId,
      name: bracketSetup.name,
      players: bracketSetup.players,
      seedingMethod: bracketSetup.seedingMethod as any,
      byeHandling: bracketSetup.byeHandling as any,
    });
    setShowCreateDialog(false);
  };

  const handleMatchResult = (winnerId: string) => {
    if (!selectedMatch) return;

    updateMatchMutation.mutate({
      matchId: selectedMatch.id,
      score: { winnerId },
    });
    setShowMatchDialog(false);
  };

  const getMatchStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-800';
      case 'InProgress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Bye': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoundName = (roundNumber: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - roundNumber + 1;
    switch (roundsFromEnd) {
      case 1: return 'Final';
      case 2: return 'Semi-Final';
      case 3: return 'Quarter-Final';
      default: return `Round ${roundNumber}`;
    }
  };

  const groupMatchesByRound = (matches: Match[]) => {
    const grouped: { [key: number]: Match[] } = {};
    matches.forEach(match => {
      if (!grouped[match.roundNumber]) {
        grouped[match.roundNumber] = [];
      }
      grouped[match.roundNumber].push(match);
    });
    return grouped;
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

  if (!bracket) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Match Play Bracket</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create a Match Play bracket to organize elimination-style matches for this tournament.
          </p>
          {canEdit && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bracket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Match Play Bracket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bracket-name">Bracket Name</Label>
                    <Input
                      id="bracket-name"
                      value={bracketSetup.name}
                      onChange={(e) => setBracketSetup(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Championship Bracket"
                    />
                  </div>

                  <div>
                    <Label>Seeding Method</Label>
                    <Select 
                      value={bracketSetup.seedingMethod} 
                      onValueChange={(value) => setBracketSetup(prev => ({ ...prev, seedingMethod: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Handicap">By Handicap</SelectItem>
                        <SelectItem value="Random">Random</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Players ({players.length} available)</Label>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                      {players.map((player: any) => (
                        <label key={player.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bracketSetup.players?.includes(player.id) || false}
                            onChange={(e) => {
                              const playerId = player.id;
                              setBracketSetup(prev => ({
                                ...prev,
                                players: e.target.checked
                                  ? [...(prev.players || []), playerId]
                                  : (prev.players || []).filter(id => id !== playerId)
                              }));
                            }}
                          />
                          <span className="text-sm">{player.firstName} {player.lastName}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateBracket}
                      disabled={!bracketSetup.name || !bracketSetup.players?.length || createBracketMutation.isPending}
                    >
                      {createBracketMutation.isPending ? 'Creating...' : 'Create Bracket'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    );
  }

  const matchesByRound = groupMatchesByRound(bracket.matches);
  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Bracket Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {bracket.name}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {bracket.matches.filter(m => m.player1 || m.player2).length * 2} players
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Round {bracket.currentRound} of {bracket.totalRounds}
                </span>
              </div>
            </div>
            <Badge className={
              bracket.status === 'Setup' ? 'bg-gray-100 text-gray-800' :
              bracket.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }>
              {bracket.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Bracket Visualization */}
      <div className="overflow-x-auto">
        <div className="flex gap-8 min-w-max p-4">
          {rounds.map((roundNumber) => (
            <div key={roundNumber} className="flex flex-col items-center space-y-4 min-w-[280px]">
              <h3 className="text-lg font-semibold text-center">
                {getRoundName(roundNumber, bracket.totalRounds)}
              </h3>
              <div className="space-y-4">
                {matchesByRound[roundNumber].map((match) => (
                  <Card 
                    key={match.id} 
                    className={`w-full cursor-pointer hover:shadow-md transition-shadow ${
                      canEdit && match.status === 'InProgress' ? 'ring-2 ring-blue-200' : ''
                    }`}
                    onClick={() => {
                      if (canEdit && (match.status === 'InProgress' || match.status === 'Pending')) {
                        setSelectedMatch(match);
                        setShowMatchDialog(true);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Match {match.matchNumber}</span>
                          <Badge className={getMatchStatusColor(match.status)}>
                            {match.status}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {/* Player 1 */}
                          <div className={`flex items-center justify-between p-2 rounded ${
                            match.winner?.playerId === match.player1?.playerId ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center gap-2">
                              {match.winner?.playerId === match.player1?.playerId && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                              <span className="font-medium">
                                {match.player1?.playerName || 'TBD'}
                              </span>
                            </div>
                            {match.player1?.seed && (
                              <Badge variant="outline" className="text-xs">
                                #{match.player1.seed}
                              </Badge>
                            )}
                          </div>

                          {/* VS Separator */}
                          <div className="text-center text-xs text-muted-foreground">vs</div>

                          {/* Player 2 */}
                          <div className={`flex items-center justify-between p-2 rounded ${
                            match.winner?.playerId === match.player2?.playerId ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center gap-2">
                              {match.winner?.playerId === match.player2?.playerId && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                              <span className="font-medium">
                                {match.player2?.playerName || 'TBD'}
                              </span>
                            </div>
                            {match.player2?.seed && (
                              <Badge variant="outline" className="text-xs">
                                #{match.player2.seed}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {match.scheduledTime && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(match.scheduledTime).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Result Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Match Result</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium">Match {selectedMatch.matchNumber}</h4>
                <p className="text-sm text-muted-foreground">
                  {getRoundName(selectedMatch.roundNumber, bracket.totalRounds)}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Select Winner:</p>
                
                {selectedMatch.player1 && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleMatchResult(selectedMatch.player1!.playerId)}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {selectedMatch.player1.playerName}
                    {selectedMatch.player1.seed && (
                      <Badge variant="outline" className="ml-auto">
                        #{selectedMatch.player1.seed}
                      </Badge>
                    )}
                  </Button>
                )}

                {selectedMatch.player2 && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleMatchResult(selectedMatch.player2!.playerId)}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {selectedMatch.player2.playerName}
                    {selectedMatch.player2.seed && (
                      <Badge variant="outline" className="ml-auto">
                        #{selectedMatch.player2.seed}
                      </Badge>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
