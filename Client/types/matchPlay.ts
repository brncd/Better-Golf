export interface MatchPlayBracket {
  id: string;
  tournamentId: string;
  name: string;
  totalRounds: number;
  currentRound: number;
  status: 'Setup' | 'InProgress' | 'Completed';
  matches: Match[];
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  bracketId: string;
  roundNumber: number;
  matchNumber: number;
  player1?: MatchPlayer;
  player2?: MatchPlayer;
  winner?: MatchPlayer;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Bye';
  scheduledTime?: string;
  completedAt?: string;
  score?: MatchScore;
  nextMatchId?: string; // For advancement
}

export interface MatchPlayer {
  id: string;
  playerId: string;
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
  tournamentId: string;
  name: string;
  players: string[]; // Player IDs
  seedingMethod: 'Random' | 'Handicap' | 'Manual';
  byeHandling: 'Random' | 'LowestSeed';
}

export interface RoundAdvancement {
  roundNumber: number;
  matches: {
    matchId: string;
    winnerId: string;
  }[];
}
