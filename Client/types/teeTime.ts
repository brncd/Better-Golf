export interface TeeTime {
  id: string;
  tournamentId: string;
  roundNumber: number;
  teeTimeSlot: string; // ISO datetime string
  courseId: string;
  courseName: string;
  holeNumber: number;
  players: TeeTimePlayer[];
  maxPlayers: number;
  status: 'Available' | 'Booked' | 'InProgress' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface TeeTimePlayer {
  id: string;
  playerId: string;
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
  tournamentId: string;
  roundNumber: number;
  startDate: string;
  startTime: string;
  endTime: string;
  interval: number; // minutes between groups
  maxPlayersPerGroup: number;
  courseIds: string[];
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
  teeTimeId: string;
  playerId: string;
  position: number;
}
