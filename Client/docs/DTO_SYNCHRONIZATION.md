# DTO Synchronization Guide

This document outlines the DTO synchronization system implemented in the Better Golf project to maintain consistency between the client TypeScript types and the .NET API DTOs.

## Current Implementation Status

✅ **COMPLETED**: The Better Golf client now uses TanStack Query extensively throughout the application for all API interactions, providing excellent caching, synchronization, and error handling capabilities.

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

## Current Architecture

### TanStack Query Integration
✅ **IMPLEMENTED**: The application uses TanStack Query for:
- **Data Fetching**: All API calls use query hooks (`useQuery`, `useMutation`)
- **Caching**: Automatic response caching with intelligent invalidation
- **Error Handling**: Centralized error management with retry logic
- **Loading States**: Built-in loading and error state management
- **Optimistic Updates**: Real-time UI updates for better UX

### Service Layer
✅ **IMPLEMENTED**: Comprehensive service layer with:
- `tournamentService`: Tournament CRUD operations
- `playerService`: Player management and tournament history
- `authService`: Authentication and authorization
- `courseService`: Course and hole management
- `categoryService`: Category management

### Type Safety
✅ **IMPLEMENTED**: Full TypeScript integration with:
- Strongly typed API responses
- Type-safe service methods
- Consistent DTO interfaces across client and server
- Runtime type validation where needed

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

## Implementation Examples

### TanStack Query Usage
```typescript
// Tournament management with TanStack Query
const { data: tournaments, isLoading, error } = useQuery({
  queryKey: ['tournaments'],
  queryFn: tournamentService.getAll
});

// Player tournament history
const { data: playerHistory } = usePlayerHistory(playerId);

// Tournament creation with optimistic updates
const createTournamentMutation = useMutation({
  mutationFn: tournamentService.create,
  onSuccess: () => {
    queryClient.invalidateQueries(['tournaments']);
  }
});
```

### Error Handling
```typescript
// Centralized error handling with specific API messages
const { handleError } = useErrorHandler();

try {
  await tournamentService.create(tournamentData);
} catch (error) {
  handleError(error); // Shows user-friendly error messages
}
```

## Current Status

✅ **COMPLETED FEATURES**:
- Tournament creation with dynamic round configuration
- Player tournament history with detailed statistics
- Enhanced error handling with specific API messages
- Complete TanStack Query integration
- Type-safe API interactions
- Centralized service layer
- Role-based authentication and authorization

## Future Enhancements

- [ ] Real-time updates with WebSocket integration
- [ ] Offline support with TanStack Query persistence
- [ ] Advanced caching strategies for large datasets
- [ ] Automated type generation from OpenAPI specs
