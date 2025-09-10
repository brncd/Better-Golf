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
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface User {
  email: string;
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

export interface PLayerPostDTO {
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
  id: string;
  name: string;
  description: string;
  status: "Draft" | "OpenRegistration" | "InProgress" | "Completed" | "Archived";
  type: string;
  startDate: string;
  endDate: string;
  courseId: string;
  courseName: string;
  maxPlayers: number;
  registeredPlayers: number;
  createdAt: string;
  updatedAt: string;
}

export interface SingleTournamentDTO {
  id: string;
  name: string;
  description: string;
  status: "Draft" | "OpenRegistration" | "InProgress" | "Completed" | "Archived";
  type: string;
  startDate: string;
  endDate: string;
  courseId: string;
  courseName: string;
  maxPlayers: number;
  registeredPlayers: number;
  handicapAllowance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentPostDTO {
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  courseId: string;
  maxPlayers: number;
  handicapAllowance?: number;
}

export interface TournamentRankingDTO {
  position: number;
  playerId: string;
  playerName: string;
  totalStrokes: number;
  totalScore: number;
  roundScores: number[];
  handicap: number;
  netScore: number;
}

// ================== Course DTOs ==================
export interface CoursesListGetDTO {
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
export interface CategoryDTO {
  id: string;
  name: string;
  description: string;
  handicapMin?: number;
  handicapMax?: number;
  gender: "male" | "female" | "mixed";
  ageMin?: number;
  ageMax?: number;
}

export interface CategoryPostDTO {
  name: string;
  description: string;
  handicapMin?: number;
  handicapMax?: number;
  gender: "male" | "female" | "mixed";
  ageMin?: number;
  ageMax?: number;
}

// ================== Round & Tee Time DTOs ==================
export interface TeeTimeDTO {
  teeTime?: Date;
  startingHole?: number;
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
  id: string;
  playerId: string;
  tournamentId: string;
  roundId: string;
  totalStrokes: number;
  totalScore: number;
  isCompleted: boolean;
}

export interface ScorecardResultDTO {
  id: string;
  scorecardId: string;
  holeId: string;
  strokes: number;
  score: number;
}