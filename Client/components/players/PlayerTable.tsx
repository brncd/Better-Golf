'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';
import type { PlayerListGetDTO } from '@/types';

interface PlayerTableProps {
  players: PlayerListGetDTO[];
  onEdit: (player: PlayerListGetDTO) => void;
  onDelete: (playerId: number) => void;
}

export function PlayerTable({ players, onEdit, onDelete }: PlayerTableProps) {
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
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Handicap</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{player.firstName} {player.lastName}</div>
                  <div className="text-sm text-muted-foreground">ID: {player.id}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {player.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="w-3 h-3" />
                      {player.email}
                    </div>
                  )}
                  {player.phoneNumber && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3" />
                      {player.phoneNumber}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getHandicapBadgeColor(player.handicap)}>
                  {player.handicap}
                </Badge>
              </TableCell>
              <TableCell>
                {player.categoryName ? (
                  <Badge variant="outline">{player.categoryName}</Badge>
                ) : (
                  <span className="text-muted-foreground">No category</span>
                )}
              </TableCell>
              <TableCell>
                {formatDate(player.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(player)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(player.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {players.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No players found.
        </div>
      )}
    </div>
  );
}
