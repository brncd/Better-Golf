export interface RoundInfo {
  roundNumber: number;
  date: string; // ISO date string
  startTime?: string; // ISO datetime string
  endTime?: string; // ISO datetime string
  courseId: number;
  courseName?: string;
  status: RoundStatus;
  maxPlayers?: number;
  registeredPlayers?: number;
  teeTimeInterval?: number; // minutes between tee times
  playersPerGroup?: number;
  startingHole?: number;
}

export type RoundStatus = 
  | 'Scheduled'
  | 'Registration'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export interface RoundConfiguration {
  tournamentId: number;
  rounds: RoundInfo[];
  totalRounds: number;
  cutAfterRound?: number;
  playoffRounds?: number;
}

export interface RoundResult {
  roundNumber: number;
  playerId: number;
  playerName: string;
  grossScore: number;
  netScore: number;
  stablefordPoints?: number;
  position: number;
  holesCompleted: number;
  status: 'InProgress' | 'Completed' | 'Withdrawn' | 'Disqualified';
}

export interface RoundLeaderboard {
  roundNumber: number;
  results: RoundResult[];
  cutLine?: number;
  lastUpdated: string;
}
