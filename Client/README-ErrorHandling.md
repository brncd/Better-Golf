# Better Golf Client - Error Handling Guide

This document explains the comprehensive error handling system implemented in the Better Golf client application.

## Error Handling Architecture

The application uses a centralized error handling system with the following components:

### 1. Error Types (`lib/errors.ts`)

```typescript
enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION', 
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}
```

### 2. BetterGolfError Class

Custom error class that extends the native Error with additional context:

```typescript
class BetterGolfError extends Error {
  public readonly type: ErrorType
  public readonly code?: string | number
  public readonly details?: any
  public readonly timestamp: Date
}
```

### 3. Error Handling Hook (`hooks/useErrorHandler.ts`)

React hook for consistent error handling across components:

```typescript
const { error, isRetrying, canRetry, handleError, clearError, retry } = useErrorHandler({
  context: 'Tournament Management',
  maxRetries: 3
})
```

### 4. Error Display Components

- `ErrorBoundary`: Catches React errors and displays fallback UI
- `ErrorDisplay`: Configurable error display component with retry functionality

## Usage Examples

### Basic Error Handling in Components

```typescript
function TournamentList() {
  const { error, handleError, clearError } = useErrorHandler({
    context: 'Tournament List'
  })

  const fetchTournaments = async () => {
    try {
      const tournaments = await tournamentService.getAll()
      // Handle success
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <div>
      {error && (
        <ErrorDisplay 
          error={error} 
          onRetry={fetchTournaments}
          onDismiss={clearError}
        />
      )}
      {/* Component content */}
    </div>
  )
}
```

### API Service Error Handling

The API service automatically handles common HTTP errors:

```typescript
// Automatically converts HTTP errors to BetterGolfError
const response = await apiClient.get('/tournaments')
```

### Error Boundary Usage

Wrap components to catch unexpected errors:

```typescript
<ErrorBoundary fallback={<CustomErrorFallback />}>
  <TournamentManagement />
</ErrorBoundary>
```

## Error Types and Handling

### Network Errors
- **Type**: `NETWORK`
- **Retryable**: Yes
- **User Message**: "Unable to connect to the server. Please check your internet connection."

### Authentication Errors
- **Type**: `AUTHENTICATION`
- **Retryable**: No
- **Action**: Redirect to login page
- **User Message**: "Please log in to continue."

### Authorization Errors
- **Type**: `AUTHORIZATION`
- **Retryable**: No
- **User Message**: "You do not have permission to perform this action."

### Validation Errors
- **Type**: `VALIDATION`
- **Retryable**: No
- **User Message**: "Please check your input and try again."

### Not Found Errors
- **Type**: `NOT_FOUND`
- **Retryable**: No
- **User Message**: "The requested item could not be found."

### Server Errors
- **Type**: `SERVER`
- **Retryable**: Yes
- **User Message**: "A server error occurred. Please try again later."

## Logging and Monitoring

### Automatic Logging
All errors are automatically logged with context:

```typescript
logger.error('API Error: GET /tournaments', {
  type: 'NETWORK',
  message: 'Connection timeout',
  timestamp: '2024-01-01T12:00:00Z'
})
```

### Error Reporting
Errors are reported with context for debugging:

```typescript
reportError(error, 'Tournament Creation')
```

## Best Practices

### 1. Use Specific Error Types
```typescript
// Good
throw createError(ErrorType.VALIDATION, 'Tournament name is required')

// Avoid
throw new Error('Something went wrong')
```

### 2. Provide Context
```typescript
const { handleError } = useErrorHandler({
  context: 'Player Registration',
  maxRetries: 2
})
```

### 3. Handle Retryable Errors
```typescript
{error && canRetry && (
  <Button onClick={() => retry(fetchData)}>
    Try Again
  </Button>
)}
```

### 4. Show User-Friendly Messages
```typescript
<ErrorDisplay 
  error={error}
  variant="card"
  showDetails={config.development.debugMode}
/>
```

### 5. Clear Errors When Appropriate
```typescript
useEffect(() => {
  if (isSuccess) {
    clearError()
  }
}, [isSuccess, clearError])
```

## Error Display Variants

### Alert Variant (Default)
```typescript
<ErrorDisplay error={error} variant="alert" />
```

### Card Variant
```typescript
<ErrorDisplay error={error} variant="card" />
```

### Inline Variant
```typescript
<ErrorDisplay error={error} variant="inline" />
```

## Configuration

### Debug Mode
Enable detailed error information in development:

```bash
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### Production Settings
Minimize error details in production:

```bash
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=warn
```

## Testing Error Handling

### Simulate Network Errors
```typescript
// In development, you can simulate errors
if (config.development.debugMode) {
  throw createError(ErrorType.NETWORK, 'Simulated network error')
}
```

### Test Error Boundaries
```typescript
// Component that throws an error for testing
function ErrorTrigger() {
  throw new Error('Test error boundary')
}
```

## Integration with External Services

Future integrations can extend error reporting:

```typescript
// Example: Sentry integration
export const reportError = (error: BetterGolfError, context?: string) => {
  logger.error(`Error reported${context ? ` in ${context}` : ''}`, error.toAppError())
  
  // Send to external service
  if (config.external.sentryDsn) {
    Sentry.captureException(error)
  }
}
```
