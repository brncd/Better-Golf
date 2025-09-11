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
  email: string;
  username: string;
  roles: string[];
}

// ================== Player DTOs ==================
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

export interface PlayerProfileDTO {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  handicap: number;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  membershipNumber: string;
  categoryId?: string;
  categoryName?: string;
  isActive: boolean;
  createdAt: string;
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

// ================== Tournament DTOs ==================
export interface TournamentListGetDTO {
  id: number;
  name: string;
  count: number;
  description: string;
  tournamentType: string;
  startDate: string;
  endDate: string;
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
  description: string;
  tournamentType: TournamentType;
  startDate: string;
  endDate: string;
  roundInfo: RoundInfo;
  handicapAllowance?: number;
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
  playerId: string;
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
  id: string;
  name: string;
  location: string;
  numberOfHoles: number;
  par: number;
  yardage: number;
  rating: number;
  slope: number;
  description: string;
  isActive: boolean;
}

export interface CoursePostDTO {
  name: string;
  location: string;
  numberOfHoles: number;
  par: number;
  yardage: number;
  rating: number;
  slope: number;
  description: string;
}

// ================== Hole DTOs ==================
export interface HoleListGetDTO {
  id: string;
  courseId: string;
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

export interface RoundDTO {
  id: string;
  tournamentId: string;
  roundNumber: number;
  date: string;
}

// ================== Role DTOs ==================
export interface RoleAssignmentDTO {
  userId: string;
  userName: string;
  email: string;
  role: string;
  assignedAt: string;
  assignedBy: string;
}

// ================== Scorecard DTOs ==================
export interface ScorecardDTO {
  id: number;
  playerId: number;
  playerName: string;
  courseId: number;
  roundNumber: number;
  playingHandicap: number;
  totalStrokes: number;
  isLocked: boolean;
}

export interface ScorecardResultDTO {
  id: string;
  scorecardId: string;
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

