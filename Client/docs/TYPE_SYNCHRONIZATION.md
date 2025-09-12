# Type Synchronization System

## Overview

The Better Golf client now includes an automated type synchronization system that generates TypeScript types directly from the API's OpenAPI/Swagger specification. This prevents type mismatches and ensures the client always uses the correct data structures.

## Components

### 1. Type Generation Script (`scripts/generate-types.js`)

Enhanced Node.js script that:
- ✅ Checks API health and Swagger endpoint availability
- ✅ Automatically installs `openapi-typescript` if needed
- ✅ Generates raw types from OpenAPI spec
- ✅ Creates convenient type aliases for common DTOs
- ✅ Provides detailed error messages and troubleshooting

**Usage:**
```bash
npm run generate-types
```

### 2. Synchronization Script (`scripts/sync-types.sh`)

Comprehensive bash script that:
- ✅ Validates API availability
- ✅ Backs up existing types
- ✅ Generates new types
- ✅ Validates TypeScript compilation
- ✅ Creates migration guides

**Usage:**
```bash
npm run sync-types
```

### 3. GitHub Actions Workflow (`.github/workflows/sync-types.yml`)

Automated workflow that:
- ✅ Runs daily or on manual trigger
- ✅ Generates types from running API
- ✅ Creates pull requests for type updates
- ✅ Includes verification checklist

## Generated Files

### `types/api-generated.ts`
Raw TypeScript types generated directly from the OpenAPI specification.

### `types/api-aliases.ts`
Convenient type aliases for common DTOs:
```typescript
export type TournamentPostDTO = components['schemas']['TournamentPostDTO'];
export type SingleTournamentDTO = components['schemas']['SingleTournamentDTO'];
// ... other aliases
```

### `types/MIGRATION_GUIDE.md`
Step-by-step guide for migrating from manual to generated types.

## Usage Examples

### Recommended Import Pattern
```typescript
import type { 
  TournamentPostDTO,
  SingleTournamentDTO,
  PlayerListGetDTO 
} from '@/types/api-aliases';
```

### Advanced Usage
```typescript
import type { components } from '@/types/api-generated';
type CustomType = components['schemas']['TournamentPostDTO'] & {
  customField: string;
};
```

## Workflow Integration

### Development Workflow
1. Start API server: `cd ../Api && dotnet run`
2. Generate types: `npm run sync-types`
3. Update imports in components
4. Run type check: `npm run type-check`
5. Test application

### CI/CD Integration
- Types are automatically synced daily via GitHub Actions
- Pull requests are created for type updates
- Manual sync available via workflow dispatch

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

## Future Enhancements

- [ ] Real-time type watching during development
- [ ] Integration with API versioning
- [ ] Custom type transformations
- [ ] Automated component updates for breaking changes
