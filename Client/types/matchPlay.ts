export interface MatchPlayBracket {
  id: number;
  tournamentId: number;
  name: string;
  totalRounds: number;
  currentRound: number;
  status: 'Setup' | 'InProgress' | 'Completed';
  matches: Match[];
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: number;
  bracketId: number;
  roundNumber: number;
  matchNumber: number;
  player1?: MatchPlayer;
  player2?: MatchPlayer;
  winner?: MatchPlayer;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Bye';
  scheduledTime?: string;
  completedAt?: string;
  score?: MatchScore;
  nextMatchId?: number; // For advancement
}

export interface MatchPlayer {
  id: number;
  playerId: number;
  playerName: string;
  handicap?: number;
  seed?: number;
}

export interface MatchScore {
  player1Score: number;
  player2Score: number;
  holesPlayed: number;
  isComplete: boolean;
  scoreDetails?: HoleScore[];
}

export interface HoleScore {
  holeNumber: number;
  player1Strokes: number;
  player2Strokes: number;
  winner: 'player1' | 'player2' | 'tie';
}

export interface BracketSetup {
  tournamentId: number;
  name: string;
  players: number[]; // Player IDs
  seedingMethod: 'Random' | 'Handicap' | 'Manual';
  byeHandling: 'Random' | 'LowestSeed';
}

export interface RoundAdvancement {
  roundNumber: number;
  matches: {
    matchId: number;
    winnerId: number;
  }[];
}
