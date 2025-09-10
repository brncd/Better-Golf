"use client"

import { useState, useCallback } from 'react'
import { BetterGolfError, ErrorType, createError, reportError, isRetryableError } from '@/lib/errors'
import { logger } from '@/lib/logger'

interface UseErrorHandlerOptions {
  context?: string
  onError?: (error: BetterGolfError) => void
  maxRetries?: number
}

interface ErrorState {
  error: BetterGolfError | null
  isRetrying: boolean
  retryCount: number
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { context, onError, maxRetries = 3 } = options
  
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
  })

  const handleError = useCallback((error: unknown, customContext?: string) => {
    let betterGolfError: BetterGolfError

    if (error instanceof BetterGolfError) {
      betterGolfError = error
    } else if (error instanceof Error) {
      betterGolfError = createError(
        ErrorType.UNKNOWN,
        error.message,
        undefined,
        { originalError: error }
      )
    } else {
      betterGolfError = createError(
        ErrorType.UNKNOWN,
        'An unexpected error occurred',
        undefined,
        { originalError: error }
      )
    }

    const errorContext = customContext || context
    reportError(betterGolfError, errorContext)

    setErrorState(prev => ({
      ...prev,
      error: betterGolfError,
      isRetrying: false,
    }))

    onError?.(betterGolfError)
  }, [context, onError])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
    })
  }, [])

  const retry = useCallback(async (retryFn: () => Promise<void> | void) => {
    if (!errorState.error || !isRetryableError(errorState.error)) {
      return
    }

    if (errorState.retryCount >= maxRetries) {
      logger.warn(`Max retries (${maxRetries}) exceeded for error`, errorState.error.toAppError())
      return
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }))

    try {
      await retryFn()
      clearError()
    } catch (error) {
      handleError(error, `${context} (retry ${errorState.retryCount + 1})`)
    }
  }, [errorState.error, errorState.retryCount, maxRetries, context, handleError, clearError])

  const canRetry = errorState.error ? 
    isRetryableError(errorState.error) && errorState.retryCount < maxRetries : 
    false

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    canRetry,
    handleError,
    clearError,
    retry,
  }
}
