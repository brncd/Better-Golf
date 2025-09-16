export type ScoringFormat = 
  | 'StrokePlay'
  | 'Stableford'
  | 'MatchPlay'
  | 'BestBall'
  | 'Scramble'
  | 'Modified Stableford';

export interface ScoringSystem {
  format: ScoringFormat;
  pointsPerBirdie?: number;
  pointsPerEagle?: number;
  pointsPerPar?: number;
  pointsPerBogey?: number;
  pointsPerDoubleBogey?: number;
  maxScorePerHole?: number;
}

export interface StablefordScoring {
  albatross: number; // -3 or better
  eagle: number;     // -2
  birdie: number;    // -1
  par: number;       // 0
  bogey: number;     // +1
  doubleBogey: number; // +2
  tripleBogeyOrWorse: number; // +3 or worse
}

export interface ScoringRule {
  id: number;
  name: string;
  format: ScoringFormat;
  description: string;
  isActive: boolean;
  settings: ScoringSystem;
}

export interface ScoreCalculation {
  grossScore: number;
  netScore: number;
  stablefordPoints?: number;
  adjustedScore?: number;
  handicapStrokes: number;
}
