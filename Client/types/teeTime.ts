export interface TeeTime {
  id: number;
  tournamentId: number;
  roundNumber: number;
  teeTimeSlot: string; // ISO datetime string
  players: TeeTimePlayer[];
  maxPlayers: number;
  status: 'Available' | 'Booked' | 'InProgress' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface TeeTimePlayer {
  id: number;
  playerId: number;
  playerName: string;
  handicap?: number;
  category?: string;
  position: number; // 1-4 for typical golf groups
}

export interface TeeTimeSlot {
  time: string; // HH:mm format
  interval: number; // minutes between tee times
  maxGroups: number;
}

export interface TeeTimeGeneration {
  tournamentId: number;
  roundNumber: number;
  startDate: string;
  startTime: string;
  endTime: string;
  interval: number; // minutes between groups
  maxPlayersPerGroup: number;
  courseIds: number[];
}

export interface TeeTimeSchedule {
  date: string;
  rounds: TeeTimeRound[];
}

export interface TeeTimeRound {
  roundNumber: number;
  teeTimes: TeeTime[];
}

export interface TeeTimeAssignment {
  teeTimeId: number;
  playerId: number;
  position: number;
}
