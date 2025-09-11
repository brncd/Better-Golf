'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Mail, Phone, Calendar, Trophy } from 'lucide-react';
import type { PlayerListGetDTO } from '@/types';

interface PlayerCardProps {
  player: PlayerListGetDTO;
  onEdit: (player: PlayerListGetDTO) => void;
  onDelete: (playerId: string) => void;
}

export function PlayerCard({ player, onEdit, onDelete }: PlayerCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getHandicapBadgeColor = (handicap: number) => {
    if (handicap <= 5) return 'bg-green-100 text-green-800';
    if (handicap <= 15) return 'bg-blue-100 text-blue-800';
    if (handicap <= 25) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {player.firstName} {player.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">ID: {player.id}</p>
          </div>
          <Badge className={getHandicapBadgeColor(player.handicap)}>
            <Trophy className="w-3 h-3 mr-1" />
            {player.handicap}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {player.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{player.email}</span>
            </div>
          )}
          {player.phoneNumber && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{player.phoneNumber}</span>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Category:</span>
          {player.categoryName ? (
            <Badge variant="outline">{player.categoryName}</Badge>
          ) : (
            <span className="text-sm text-muted-foreground">No category assigned</span>
          )}
        </div>

        {/* Join Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Joined {formatDate(player.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(player)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(player.id)}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
