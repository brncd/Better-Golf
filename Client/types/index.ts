// types/index.ts

// Base DTO for pagination
export interface PaginationResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  items: T[];
}

// ================== Player DTOs ==================
export interface PlayerListGetDTO {
  id: number;
  matriculaAUG: number;
  name: string;
  lastName: string;
  handicapIndex: string;
}

export interface SinglePLayerDTO {
    id: number;
    matriculaAUG: number;
    name: string;
    lastName: string;
    handicapIndex: number;
    birthdate: string; // DateOnly
    isPreferredCategoryLadies: boolean;
}

export interface PLayerPostDTO {
    matriculaAUG: number;
    name: string;
    lastName: string;
    handicapIndex: number;
    birthdate: string; // DateOnly
    isPreferredCategoryLadies: boolean;
}

// ================== Tournament DTOs ==================
export interface TournamentListGetDTO {
  id: number;
  name: string;
  tournamentType: string;
  startDate: string; // DateOnly
  endDate: string; // DateOnly
  playerCount: number;
  status: "Draft" | "OpenRegistration" | "InProgress" | "Completed" | "Archived";
}

export interface SingleTournamentDTO {
    id: number;
    name: string;
    count: number;
    description: string;
    tournamentType: string;
    startDate: string; // DateOnly
    endDate: string; // DateOnly
    roundInfo: RoundInfo;
}

export interface TournamentPostDTO {
    name: string;
    description: string;
    tournamentType: string; // Enum as string
    startDate: string; // DateOnly
    endDate: string; // DateOnly
    roundInfo: RoundInfo;
    handicapAllowance?: number;
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

// ================== Hole DTOs ==================
export interface HoleListGetDTO {
    id: number;
    par: number;
    number: number;
    strokeIndex: number;
}

export interface HolePostDTO {
    par: number;
    number: number;
    strokeIndex: number;
}

// ================== Category DTOs ==================
export interface CategoryListGetDTO {
    id: number;
    name: string;
    sex: string;
    count: number;
}

export interface SingleCategoryDTO {
    id: number;
    name: string;
    sex: string;
    minAge: number;
    maxAge: number;
    minHcap: number;
    maxHcap: number;
    numberOfHoles: number;
}

export interface CategoryPostDTO {
    name: string;
    sex: string; // Enum as string
    minAge: number;
    maxAge: number;
    minHcap: number;
    maxHcap: number;
    numberOfHoles: number;
}

// ================== Other DTOs ==================
export interface RoundInfo {
    id: number;
    interval: number;
    firstRoundTime: number;
    isShotgun: boolean;
}