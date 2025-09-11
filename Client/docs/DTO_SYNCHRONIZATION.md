# DTO Synchronization Guide

This document outlines the critical DTO synchronization issues that were identified and resolved between the Better Golf client and API.

## Problem Summary

The client TypeScript DTOs were not synchronized with the actual .NET API DTOs, causing runtime errors, failed API calls, and data display issues.

## Critical Mismatches Identified and Fixed

### 1. TournamentPostDTO
**Before (Incorrect):**
```typescript
interface TournamentPostDTO {
  name: string;
  description: string;
  type: string;           // ❌ Wrong property name
  startDate: string;
  endDate: string;
  courseId: string;       // ❌ Wrong property
  maxPlayers: number;     // ❌ Wrong property
  handicapAllowance?: number;
}
```

**After (Correct):**
```typescript
interface TournamentPostDTO {
  name: string;
  description: string;
  tournamentType: TournamentType;  // ✅ Correct enum type
  startDate: string;
  endDate: string;
  roundInfo: RoundInfo;            // ✅ Correct nested object
  handicapAllowance?: number;
}
```

### 2. SingleTournamentDTO
**Before (Incorrect):**
```typescript
interface SingleTournamentDTO {
  id: string;             // ❌ Wrong type
  name: string;
  status: string;         // ❌ Property doesn't exist in API
  maxPlayers: number;     // ❌ Property doesn't exist in API
  registeredPlayers: number; // ❌ Property doesn't exist in API
}
```

**After (Correct):**
```typescript
interface SingleTournamentDTO {
  id: number;             // ✅ Correct type
  name: string;
  count: number;          // ✅ Actual API property
  description: string;
  tournamentType: string; // ✅ Correct property name
  startDate: string;
  endDate: string;
  roundInfo: RoundInfo;   // ✅ Required nested object
}
```

### 3. PlayerPostDTO
**Before (Incorrect):**
```typescript
interface PlayerPostDTO {
  firstName: string;
  lastName: string;
  email: string;
  handicap: number;
  gender: string;
  dateOfBirth: string;
  phoneNumber?: string;   // ❌ Optional when API requires it
  membershipNumber: string;
}
```

**After (Correct):**
```typescript
interface PlayerPostDTO {
  firstName: string;
  lastName: string;
  email: string;
  handicap: number;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;    // ✅ Required by API
  membershipNumber: string;
}
```

### 4. TournamentRankingDTO
**Before (Incorrect):**
```typescript
interface TournamentRankingDTO {
  playerId: string;
  playerName: string;
  totalStrokes: number;   // ❌ Wrong property name
  position: number;
}
```

**After (Correct):**
```typescript
interface TournamentRankingDTO {
  playerId: string;
  playerName: string;
  totalScore: number;     // ✅ Correct property name
  scoreToPar: number;     // ✅ Missing property added
  position: number;
  roundScores: number[];  // ✅ Missing property added
}
```

## New Types Added

### TournamentType Enum
```typescript
export enum TournamentType {
  MedalPlay = "MedalPlay",
  Stableford = "Stableford", 
  MatchPlay = "MatchPlay"
}
```

### RoundInfo Interface
```typescript
export interface RoundInfo {
  id: number;
  interval: number;
  firstRoundTime: number;
  isShotgun: boolean;
}
```

## Automated Type Generation

### Setup
1. **OpenAPI TypeScript Tool**: Installed `openapi-typescript` for automatic type generation
2. **Generation Script**: Created `scripts/generate-types.js` for automated workflow
3. **GitHub Actions**: Set up automated type synchronization workflow

### Usage
```bash
# Generate types from running API
npm run generate-types

# Type check after generation
npm run type-check
```

### Workflow Integration
- **Daily automated checks** via GitHub Actions
- **API change detection** on push to main/develop
- **Automatic PR creation** for type updates

## Component Updates Required

### Tournament Detail Page
- ✅ Replace `tournament.status` with hardcoded status or remove
- ✅ Replace `tournament.type` with `tournament.tournamentType`
- ✅ Replace `tournament.registeredPlayers` with `tournament.count`
- ✅ Replace `ranking.totalStrokes` with `ranking.totalScore`

### Service Layer Updates
- ✅ Updated `tournamentService` imports to include new types
- ✅ Updated API calls to use correct DTO structure
- ✅ Added proper type annotations for all service methods

## Testing Strategy

1. **Type Checking**: Run `npm run type-check` before deployment
2. **API Integration Tests**: Verify all CRUD operations work with corrected DTOs
3. **Component Testing**: Ensure UI components display data correctly
4. **End-to-End Testing**: Test complete user workflows

## Best Practices Going Forward

1. **Always generate types from API**: Use automated tools instead of manual typing
2. **Regular synchronization**: Set up automated checks for DTO drift
3. **Version control**: Track API changes and corresponding client updates
4. **Documentation**: Keep this document updated with any new DTO changes

## Monitoring and Maintenance

- **GitHub Actions workflow** runs daily to check for API changes
- **Pull requests** are automatically created when types need updating
- **Type checking** is integrated into the build process
- **Breaking changes** are flagged during CI/CD pipeline

## Impact Assessment

### Before Fix
- ❌ Runtime errors due to property mismatches
- ❌ Failed API calls with incorrect payloads
- ❌ Missing data in UI components
- ❌ Type safety compromised

### After Fix
- ✅ Type-safe API interactions
- ✅ Consistent data flow between client and server
- ✅ Automated synchronization prevents future drift
- ✅ Improved developer experience with accurate IntelliSense

## Next Steps

1. ✅ Complete remaining component updates
2. ⏳ Test all API integrations thoroughly
3. ⏳ Deploy automated type generation workflow
4. ⏳ Monitor for any remaining synchronization issues
