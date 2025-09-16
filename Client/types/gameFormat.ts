export type GameFormat = 
  | 'StrokePlay'
  | 'Stableford'
  | 'MatchPlay'
  | 'BestBall'
  | 'Scramble'
  | 'FourBall'
  | 'Foursomes'
  | 'Modified Stableford'
  | 'Skins'
  | 'Nassau';

export interface GameFormatConfig {
  format: GameFormat;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  teamBased: boolean;
  scoringMethod: 'Gross' | 'Net' | 'Points' | 'MatchPlay';
  allowHandicaps: boolean;
  settings?: GameFormatSettings;
}

export interface GameFormatSettings {
  // Stableford settings
  stablefordPoints?: {
    albatross: number;
    eagle: number;
    birdie: number;
    par: number;
    bogey: number;
    doubleBogey: number;
    tripleBogeyOrWorse: number;
  };
  
  // Match Play settings
  matchPlayHoles?: number;
  matchPlayFormat?: 'Singles' | 'Foursomes' | 'FourBall';
  
  // Team settings
  teamSize?: number;
  scoresToCount?: number; // For team events, how many scores count
  
  // General settings
  maxScorePerHole?: number;
  cutRule?: boolean;
  playoffFormat?: GameFormat;
}

export interface FormatRule {
  id: number;
  formatId: GameFormat;
  rule: string;
  description: string;
  isActive: boolean;
}

export const GAME_FORMAT_CONFIGS: Record<GameFormat, GameFormatConfig> = {
  StrokePlay: {
    format: 'StrokePlay',
    name: 'Stroke Play',
    description: 'Traditional golf scoring - lowest total score wins',
    minPlayers: 1,
    maxPlayers: 144,
    teamBased: false,
    scoringMethod: 'Gross',
    allowHandicaps: true,
  },
  Stableford: {
    format: 'Stableford',
    name: 'Stableford',
    description: 'Points-based scoring system',
    minPlayers: 1,
    maxPlayers: 144,
    teamBased: false,
    scoringMethod: 'Points',
    allowHandicaps: true,
    settings: {
      stablefordPoints: {
        albatross: 5,
        eagle: 4,
        birdie: 3,
        par: 2,
        bogey: 1,
        doubleBogey: 0,
        tripleBogeyOrWorse: 0,
      },
    },
  },
  MatchPlay: {
    format: 'MatchPlay',
    name: 'Match Play',
    description: 'Head-to-head competition, hole by hole',
    minPlayers: 2,
    maxPlayers: 128,
    teamBased: false,
    scoringMethod: 'MatchPlay',
    allowHandicaps: true,
    settings: {
      matchPlayHoles: 18,
      matchPlayFormat: 'Singles',
    },
  },
  BestBall: {
    format: 'BestBall',
    name: 'Best Ball',
    description: 'Team format - best score on each hole counts',
    minPlayers: 2,
    maxPlayers: 144,
    teamBased: true,
    scoringMethod: 'Gross',
    allowHandicaps: true,
    settings: {
      teamSize: 2,
      scoresToCount: 1,
    },
  },
  Scramble: {
    format: 'Scramble',
    name: 'Scramble',
    description: 'Team plays from best shot position',
    minPlayers: 2,
    maxPlayers: 144,
    teamBased: true,
    scoringMethod: 'Gross',
    allowHandicaps: true,
    settings: {
      teamSize: 4,
      scoresToCount: 1,
    },
  },
  FourBall: {
    format: 'FourBall',
    name: 'Four Ball',
    description: 'Two-person team, best ball format',
    minPlayers: 4,
    maxPlayers: 144,
    teamBased: true,
    scoringMethod: 'Gross',
    allowHandicaps: true,
    settings: {
      teamSize: 2,
      scoresToCount: 1,
    },
  },
  Foursomes: {
    format: 'Foursomes',
    name: 'Foursomes',
    description: 'Two-person team, alternate shot format',
    minPlayers: 4,
    maxPlayers: 144,
    teamBased: true,
    scoringMethod: 'Gross',
    allowHandicaps: true,
    settings: {
      teamSize: 2,
      scoresToCount: 1,
    },
  },
  'Modified Stableford': {
    format: 'Modified Stableford',
    name: 'Modified Stableford',
    description: 'Stableford with custom point values',
    minPlayers: 1,
    maxPlayers: 144,
    teamBased: false,
    scoringMethod: 'Points',
    allowHandicaps: true,
  },
  Skins: {
    format: 'Skins',
    name: 'Skins',
    description: 'Winner of each hole takes the skin',
    minPlayers: 2,
    maxPlayers: 4,
    teamBased: false,
    scoringMethod: 'Gross',
    allowHandicaps: true,
  },
  Nassau: {
    format: 'Nassau',
    name: 'Nassau',
    description: 'Three separate competitions: front 9, back 9, and overall',
    minPlayers: 2,
    maxPlayers: 4,
    teamBased: false,
    scoringMethod: 'Gross',
    allowHandicaps: true,
  },
};
