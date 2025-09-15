'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  UserCheck, 
  Trophy, 
  Archive, 
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useSetTournamentStatus } from '@/hooks/useTournaments';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import type { SingleTournamentDTO } from '@/types';

interface TournamentLifecycleControlsProps {
  tournament: SingleTournamentDTO;
  canManage: boolean;
}

export function TournamentLifecycleControls({ 
  tournament, 
  canManage 
}: TournamentLifecycleControlsProps) {
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  
  const setStatusMutation = useSetTournamentStatus();

  if (!canManage) {
    return null;
  }

  const currentStatus = tournament?.status || 'Draft';
  const tournamentId = tournament?.id;

  const handleOpenRegistration = () => {
    setStatusMutation.mutate({ 
      tournamentId, 
      status: 'OpenRegistration' 
    });
    setShowOpenDialog(false);
  };

  const handleStartTournament = () => {
    setStatusMutation.mutate({ 
      tournamentId, 
      status: 'InProgress' 
    });
    setShowStartDialog(false);
  };

  const handleCompleteTournament = () => {
    setStatusMutation.mutate({ 
      tournamentId, 
      status: 'Completed' 
    });
    setShowCompleteDialog(false);
  };

  const getStatusInfo = (status: TournamentStatus) => {
    switch (status) {
      case 'Draft':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          label: 'Draft'
        };
      case 'OpenRegistration':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: UserCheck,
          label: 'Open Registration'
        };
      case 'InProgress':
        return {
          color: 'bg-green-100 text-green-800',
          icon: Play,
          label: 'In Progress'
        };
      case 'Completed':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: CheckCircle,
          label: 'Completed'
        };
      case 'Archived':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Archive,
          label: 'Archived'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          label: status
        };
    }
  };

  const statusInfo = getStatusInfo(currentStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            Tournament Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {currentStatus === 'Draft' && (
              <Button
                onClick={() => setShowOpenDialog(true)}
                disabled={setStatusMutation.isPending}
                className="w-full"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Open Registration
              </Button>
            )}

            {currentStatus === 'OpenRegistration' && (
              <Button
                onClick={() => setShowStartDialog(true)}
                disabled={setStatusMutation.isPending}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {setStatusMutation.isPending ? 'Starting Tournament...' : 'Start Tournament'}
              </Button>
            )}

            {currentStatus === 'InProgress' && (
              <Button
                onClick={() => setShowCompleteDialog(true)}
                disabled={setStatusMutation.isPending}
                variant="outline"
                className="w-full"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Complete Tournament
              </Button>
            )}

            {(currentStatus === 'Completed' || currentStatus === 'Archived') && (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tournament lifecycle complete</p>
              </div>
            )}
          </div>

          {/* Status Description */}
          <div className="text-xs text-muted-foreground">
            {currentStatus === 'Draft' && 'Tournament is in draft mode. Open registration to allow players to join.'}
            {currentStatus === 'OpenRegistration' && 'Players can register for this tournament. Start the tournament when ready.'}
            {currentStatus === 'InProgress' && 'Tournament is active. Players can submit scores.'}
            {currentStatus === 'Completed' && 'Tournament has ended. All scorecards are locked.'}
            {currentStatus === 'Archived' && 'Tournament is archived and read-only.'}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={showOpenDialog}
        onOpenChange={setShowOpenDialog}
        title="Open Registration"
        description="This will allow players to register for the tournament. Are you sure you want to proceed?"
        confirmLabel="Open Registration"
        cancelLabel="Cancel"
        onConfirm={handleOpenRegistration}
      />

      <ConfirmDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        title="Start Tournament"
        description="This will start the tournament and generate scorecards for all registered players. Players will no longer be able to register or unregister. Are you sure you want to proceed?"
        confirmLabel="Start Tournament"
        cancelLabel="Cancel"
        onConfirm={handleStartTournament}
        variant="default"
      />

      <ConfirmDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        title="Complete Tournament"
        description="This will mark the tournament as completed and lock all scorecards. This action cannot be undone."
        confirmLabel="Complete Tournament"
        cancelLabel="Cancel"
        onConfirm={handleCompleteTournament}
        variant="destructive"
      />
    </>
  );
}
