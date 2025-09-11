// Corrected TypeScript types based on actual API DTOs
// This file contains the correct DTO structures that match the .NET API

// ================== Tournament DTOs ==================
export interface TournamentPostDTO {
  name: string;
  description: string;
  tournamentType: TournamentType;
  startDate: string; // DateOnly in C# -> string in TS
  endDate: string;   // DateOnly in C# -> string in TS
  roundInfo: RoundInfo;
  handicapAllowance?: number;
}

export interface SingleTournamentDTO {
  id: number;
  name: string;
  count: number;
  description: string;
  tournamentType: string; // Enum converted to string
  startDate: string;
  endDate: string;
  roundInfo: RoundInfo;
}

export interface TournamentListGetDTO {
  id: number;
  name: string;
  count: number;
  description: string;
  tournamentType: string;
  startDate: string;
  endDate: string;
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

// ================== Player DTOs ==================
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

export interface SinglePlayerDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  handicap: number;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  categoryId?: string;
  categoryName?: string;
  membershipNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface PlayerListGetDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  handicap: number;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  categoryId?: string;
  categoryName?: string;
  membershipNumber: string;
  isActive: boolean;
  createdAt: string;
}

// ================== Course DTOs ==================
export interface CoursePostDTO {
  name: string;
  location: string;
  description: string;
}

export interface SingleCourseDTO {
  id: number;
  name: string;
  location: string;
  description: string;
  holes?: HoleListGetDTO[];
}

export interface CoursesListGetDTO {
  id: number;
  name: string;
  location: string;
  description: string;
}

// ================== Hole DTOs ==================
export interface HolePostDTO {
  holeNumber: number;
  par: number;
  distance: number;
  courseId: number;
}

export interface HoleListGetDTO {
  id: number;
  holeNumber: number;
  par: number;
  distance: number;
  courseId: number;
}

export interface SingleHolesDTO {
  id: number;
  holeNumber: number;
  par: number;
  distance: number;
  courseId: number;
}

// ================== Category DTOs ==================
export interface CategoryPostDTO {
  name: string;
  description: string;
  handicapMin?: number;
  handicapMax?: number;
  ageMin?: number;
  ageMax?: number;
  gender: string;
}

export interface SingleCategoryDTO {
  id: string;
  name: string;
  description: string;
  handicapMin?: number;
  handicapMax?: number;
  ageMin?: number;
  ageMax?: number;
  gender: string;
}

export interface CategoryListGetDTO {
  id: string;
  name: string;
  description: string;
  handicapMin?: number;
  handicapMax?: number;
  ageMin?: number;
  ageMax?: number;
  gender: string;
}

// ================== Scorecard DTOs ==================
export interface ScorecardPostDTO {
  playerId: string;
  tournamentId: number;
  roundNumber: number;
}

export interface SingleScorecardDTO {
  id: string;
  playerId: string;
  tournamentId: number;
  roundNumber: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ScorecardListGetDTO {
  id: string;
  playerId: string;
  playerName: string;
  tournamentId: number;
  roundNumber: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ================== Scorecard Result DTOs ==================
export interface ScorecardResultPostDTO {
  scorecardId: string;
  holeId: number;
  strokes: number;
}

export interface SingleScorecardResultDTO {
  id: string;
  scorecardId: string;
  holeId: number;
  strokes: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ScorecardResultListGetDTO {
  id: string;
  scorecardId: string;
  holeId: number;
  holeNumber: number;
  par: number;
  strokes: number;
  createdAt: string;
  updatedAt?: string;
}

// ================== Authentication DTOs ==================
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  user: UserInfo;
}

export interface RegisterRequestDTO {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserInfo {
  id: string;
  email: string;
  roles: string[];
}

// ================== Role DTOs ==================
export interface RoleAssignmentDTO {
  userId: string;
  userName: string;
  email: string;
  role: "admin" | "tournament-director" | "player" | "viewer";
  assignedAt: string;
  assignedBy: string;
}

// ================== Result DTOs ==================
export interface TournamentRankingDTO {
  playerId: string;
  playerName: string;
  totalScore: number;
  scoreToPar: number;
  position: number;
  roundScores: number[];
}

// ================== Tee Time DTOs ==================
export interface TeeTimeDTO {
  id?: string;
  teeTime?: string;
  startingHole?: number;
  players?: TeeTimePlayerDTO[];
}

export interface TeeTimePlayerDTO {
  id: string;
  name: string;
  email: string;
  handicap?: number;
}

// ================== Match DTOs ==================
export interface MatchDTO {
  id: string;
  tournamentId: number;
  player1Id: string;
  player2Id: string;
  roundNumber: number;
  status: string;
  winnerId?: string;
  createdAt: string;
}

export interface MatchHoleResultDTO {
  id: string;
  matchId: string;
  holeNumber: number;
  player1Score: number;
  player2Score: number;
  winner?: string;
}

export interface PostMatchHoleResultDTO {
  matchId: string;
  holeNumber: number;
  player1Score: number;
  player2Score: number;
}

// ================== Common Types ==================
export interface PaginationRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginationResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
