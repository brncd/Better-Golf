# Type Synchronization System

## Overview

The Better Golf client uses a comprehensive type synchronization approach with TanStack Query integration to ensure type safety and consistency between the client and API. The application has evolved beyond the initial automated generation concept to a robust, production-ready implementation.

## Current Implementation

### 1. TanStack Query Integration

✅ **IMPLEMENTED**: The application uses TanStack Query extensively for:
- **Data Fetching**: All API calls use query hooks (`useQuery`, `useMutation`)
- **Caching**: Intelligent response caching with automatic invalidation
- **Error Handling**: Centralized error management with retry logic
- **Loading States**: Built-in loading and error state management
- **Optimistic Updates**: Real-time UI updates for better user experience

### 2. Service Layer Architecture

✅ **IMPLEMENTED**: Comprehensive service layer with:
- `tournamentService`: Tournament CRUD operations with TanStack Query
- `playerService`: Player management and tournament history
- `authService`: Authentication and authorization
- `courseService`: Course and hole management
- `categoryService`: Category management

### 3. Type Safety System

✅ **IMPLEMENTED**: Full TypeScript integration with:
- Strongly typed API responses and requests
- Type-safe service methods with proper error handling
- Consistent DTO interfaces across client and server
- Runtime type validation where needed

## Type Definitions

### `types/index.ts`
✅ **IMPLEMENTED**: Centralized type definitions including:
```typescript
// Tournament DTOs
export interface TournamentPostDTO {
  name: string;
  description?: string;
  tournamentType: string;
  startDate: string;
  endDate: string;
  roundInfo?: RoundInfo;
  handicapAllowance?: number;
}

// Player DTOs
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
```

## Usage Examples

### Current Usage Pattern
```typescript
// Import from centralized types
import type { 
  TournamentPostDTO,
  SingleTournamentDTO,
  PlayerTournamentHistoryListDTO 
} from '@/types';

// TanStack Query hooks
import { useQuery, useMutation } from '@tanstack/react-query';
import { tournamentService } from '@/lib/services/tournamentService';
```

### TanStack Query Integration Examples
```typescript
// Tournament list with caching
const { data: tournaments, isLoading, error } = useQuery({
  queryKey: ['tournaments'],
  queryFn: tournamentService.getAll,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Player tournament history
const { data: playerHistory } = usePlayerHistory(playerId);

// Tournament creation with optimistic updates
const createMutation = useMutation({
  mutationFn: tournamentService.create,
  onSuccess: () => {
    queryClient.invalidateQueries(['tournaments']);
  },
});
```

## Current Architecture Benefits

### ✅ **Production Ready**
- Complete TanStack Query integration across all components
- Centralized error handling with user-friendly messages
- Type-safe API interactions with proper validation
- Optimistic updates for better user experience

### ✅ **Developer Experience**
- Consistent service layer patterns
- Comprehensive TypeScript coverage
- Clear separation of concerns
- Reusable hooks and utilities

## Benefits

### ✅ **Type Safety**
- Eliminates manual type definition errors
- Ensures client-server type consistency
- Catches breaking changes early

### ✅ **Automation**
- No manual type maintenance required
- Automatic detection of API changes
- Integrated with development workflow

### ✅ **Developer Experience**
- Clear error messages and troubleshooting
- Migration guides for type updates
- Convenient type aliases for common use cases

## Troubleshooting

### API Not Running
```bash
# Error: API is not accessible
# Solution: Start the API server
cd ../Api && dotnet run
```

### Swagger Endpoint Issues
```bash
# Error: Swagger endpoint not accessible
# Check: API configuration includes Swagger
# Check: Endpoint http://localhost:5100/swagger/v1/swagger.json
```

### Type Conflicts
```bash
# Run type check to identify conflicts
npm run type-check

# Check migration guide
cat types/MIGRATION_GUIDE.md
```

## Configuration

### Environment Variables
- `API_URL`: API base URL (default: http://localhost:5100)

### Package.json Scripts
- `generate-types`: Generate types from API
- `sync-types`: Full synchronization with validation
- `type-check`: Validate TypeScript compilation

## Implemented Features

✅ **COMPLETED**:
- Tournament creation with dynamic round configuration
- Player tournament history with detailed statistics  
- Enhanced error handling with specific API messages
- Complete TanStack Query integration
- Type-safe API interactions
- Centralized service layer
- Role-based authentication and authorization
- Real-time data synchronization with intelligent caching

## Future Enhancements

- [ ] WebSocket integration for real-time updates
- [ ] Offline support with TanStack Query persistence
- [ ] Advanced caching strategies for large datasets
- [ ] Automated OpenAPI type generation integration
