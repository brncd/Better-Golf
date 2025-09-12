// types/index.ts

// Base DTO for pagination
export interface PaginationRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginationResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  items: T[];
}

// ================== Authentication DTOs ==================
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  username: string;
  roles: string[];
  expiration: string;
}

export interface User {
  id?: number;
  email: string;
  username: string;
  roles: string[];
}

// ================== Player DTOs ==================
export interface PlayerListGetDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  handicap: number;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  categoryId?: number;
  membershipNumber: string;
  categoryName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PlayerProfileDTO {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  handicap: number;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  membershipNumber: string;
  categoryId?: number;
  categoryName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SinglePlayerDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  handicap: number;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  categoryId?: number;
  categoryName?: string;
  membershipNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface PlayerPostDTO {
  firstName: string;
  lastName: string;
  email: string;
  handicap: number;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  membershipNumber: string;
}

export interface PlayerTournamentHistoryDTO {
  tournamentId: number;
  tournamentName: string;
  tournamentType: string;
  startDate: string;
  endDate: string;
  status: string;
  position?: number;
  totalScore?: number;
  stablefordPoints?: number;
  roundsPlayed: number;
  totalRounds: number;
  registrationDate: string;
}

export interface PlayerTournamentHistoryListDTO {
  playerId: number;
  playerName: string;
  tournaments: PlayerTournamentHistoryDTO[];
  totalTournaments: number;
  completedTournaments: number;
  wonTournaments: number;
  top3Finishes: number;
  averageScore: number;
}

// ================== Tournament DTOs ==================
export interface TournamentListGetDTO {
  id: number;
  name: string;
  tournamentType: string;
  startDate: string;
  endDate: string;
  playerCount: number;
}

export interface SingleTournamentDTO {
  id: number;
  name: string;
  count: number;
  description: string;
  tournamentType: string;
  startDate: string;
  endDate: string;
  roundInfo: RoundInfo;
}

export interface TournamentPostDTO {
  name: string;
  description?: string;           // Optional like in API
  tournamentType: string;         // API expects string enum values
  startDate: string;              // Keep string, convert in service
  endDate: string;                // Keep string, convert in service
  roundInfo?: {                   // Optional RoundInfo object
    startTime: string;
    endTime: string;
    intervalMinutes: number;
    maxPlayersPerGroup: number;
  };
  handicapAllowance?: number;     // Optional decimal value
}

export enum TournamentType {
  MedalPlay = "MedalPlay",
  Stableford = "Stableford", 
  MatchPlay = "MatchPlay"
}

export interface RoundInfo {
  id: number;
  interval: number;
  firstRoundTime: number;
  isShotgun: boolean;
}

export interface TournamentRankingDTO {
  playerId: number;
  playerName: string;
  totalScore: number;
  scoreToPar: number;
  position: number;
  roundScores: number[];
}

// ================== Course DTOs ==================
export interface CoursesListGetDTO {
  id: number;
  name: string;
}

export interface SingleCourseDTO {
  id: number;
  name: string;
  courseSlope: number;
  courseRating: number;
  par: number;
}

export interface CoursePostDTO {
  name: string;
  courseSlope: number;
  courseRating: number;
  par: number;
}

export interface CourseCreateDTO {
  name: string;
  courseSlope: number;
  courseRating: number;
  par: number;
  description: string;
}

// ================== Hole DTOs ==================
export interface HoleListGetDTO {
  id: number;
  courseId: number;
  holeNumber: number;
  par: number;
  yardage: number;
  handicap: number;
  description: string;
}

export interface HolePostDTO {
  holeNumber: number;
  par: number;
  yardage: number;
  handicap: number;
  description: string;
}

// ================== Category DTOs ==================
export interface Category {
  id: number;
  name: string;
  description: string;
  handicapMin?: number;
  handicapMax?: number;
  ageMin?: number;
  ageMax?: number;
  gender: string;
}

export interface CategoryListGetDTO {
  id: number;
  name: string;
  description: string;
  handicapMin?: number;
  handicapMax?: number;
  ageMin?: number;
  ageMax?: number;
  gender: string;
}

export interface SingleCategoryDTO {
  id: number;
  name: string;
  description: string;
  handicapMin?: number;
  handicapMax?: number;
  ageMin?: number;
  ageMax?: number;
  gender: string;
}

export interface CategoryPostDTO {
  name: string;
  description: string;
  handicapMin?: number;
  handicapMax?: number;
  ageMin?: number;
  ageMax?: number;
  gender: string;
}

// ================== Round & Tee Time DTOs ==================
export interface TeeTimeDTO {
  id?: number;
  teeTime?: string;
  startingHole?: number;
  players?: TeeTimePlayerDTO[];
}

export interface TeeTimePlayerDTO {
  id: number;
  name: string;
  email: string;
  handicap?: number;
}

export interface RoundDTO {
  id: number;
  tournamentId: number;
  roundNumber: number;
  date: string;
}

// Enhanced Tee Time Management Types
export interface TeeTime {
  id: number;
  tournamentId: number;
  roundNumber: number;
  teeTimeSlot: string; // ISO datetime string
  courseId: number;
  courseName: string;
  holeNumber: number;
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

// ================== Match Play DTOs ==================
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

// ================== Role DTOs ==================
export interface RoleAssignmentDTO {
  userId: number;
  userName: string;
  email: string;
  role: string;
  assignedAt: string;
  assignedBy: string;
}

export interface UserWithRoles {
  id: number;
  userName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

// ================== Scorecard DTOs ==================
export interface ScorecardDTO {
  id: number;
  playerId: number;
  courseId: number;
  roundNumber: number;
  playingHandicap: number;
  totalStrokes: number;
  isLocked: boolean;
}

export interface ScorecardResultDTO {
  id: number;
  scorecardId: number;
  holeId: number;
  strokes: number;
  score: number;
}

// ================== Course Detail DTOs ==================
export interface HoleDTO {
  id: number;
  holeNumber: number;
  par: number;
  distance: number;
  courseId: number;
}

export interface CourseDetailGetDTO {
  id: number;
  name: string;
  location: string;
  description: string;
  holes: HoleDTO[];
}
