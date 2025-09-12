/**
 * Centralized error handling utilities for the Better Golf application
 */

import { logger } from './logger'

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType
  message: string
  code?: string | number
  details?: any
  timestamp: Date
}

export class BetterGolfError extends Error {
  public readonly type: ErrorType
  public readonly code?: string | number
  public readonly details?: any
  public readonly timestamp: Date

  constructor(type: ErrorType, message: string, code?: string | number, details?: any) {
    super(message)
    this.name = 'BetterGolfError'
    this.type = type
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }

  toAppError(): AppError {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    }
  }
}

export const createError = (
  type: ErrorType,
  message: string,
  code?: string | number,
  details?: any
): BetterGolfError => {
  return new BetterGolfError(type, message, code, details)
}

export const handleApiError = (error: any): BetterGolfError => {
  logger.apiError('Unknown', 'Unknown', error)

  // Handle network errors
  if (!error.response) {
    return createError(
      ErrorType.NETWORK,
      'Network error. Please check your internet connection.',
      'NETWORK_ERROR',
      error
    )
  }

  const { status, data } = error.response

  // Extract specific error messages from API response
  const getSpecificMessage = (data: any, fallback: string): string => {
    // Check for validation errors array
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.join(', ')
    }
    
    // Check for single error message
    if (data?.message) {
      return data.message
    }
    
    // Check for title field (common in ASP.NET Core responses)
    if (data?.title) {
      return data.title
    }
    
    // Check for detail field
    if (data?.detail) {
      return data.detail
    }
    
    // Check for specific field validation errors
    if (data?.errors && typeof data.errors === 'object') {
      const fieldErrors = Object.entries(data.errors)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('; ')
      if (fieldErrors) return fieldErrors
    }
    
    return fallback
  }

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      return createError(
        ErrorType.VALIDATION,
        getSpecificMessage(data, 'Invalid request data.'),
        status,
        data
      )
    case 401:
      return createError(
        ErrorType.AUTHENTICATION,
        getSpecificMessage(data, 'Authentication required. Please log in.'),
        status,
        data
      )
    case 403:
      return createError(
        ErrorType.AUTHORIZATION,
        getSpecificMessage(data, 'You do not have permission to perform this action.'),
        status,
        data
      )
    case 404:
      return createError(
        ErrorType.NOT_FOUND,
        getSpecificMessage(data, 'The requested resource was not found.'),
        status,
        data
      )
    case 409:
      return createError(
        ErrorType.VALIDATION,
        getSpecificMessage(data, 'A conflict occurred. The resource may already exist.'),
        status,
        data
      )
    case 422:
      return createError(
        ErrorType.VALIDATION,
        getSpecificMessage(data, 'Validation failed.'),
        status,
        data
      )
    case 500:
    case 502:
    case 503:
    case 504:
      return createError(
        ErrorType.SERVER,
        getSpecificMessage(data, 'Server error. Please try again later.'),
        status,
        data
      )
    default:
      return createError(
        ErrorType.UNKNOWN,
        getSpecificMessage(data, 'An unexpected error occurred.'),
        status,
        data
      )
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof BetterGolfError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred.'
}

export const isRetryableError = (error: BetterGolfError): boolean => {
  return [ErrorType.NETWORK, ErrorType.SERVER].includes(error.type)
}

export const shouldShowToUser = (error: BetterGolfError): boolean => {
  // Don't show technical errors to users
  return ![ErrorType.UNKNOWN].includes(error.type)
}

// Error reporting utilities
export const reportError = (error: BetterGolfError, context?: string): void => {
  logger.error(`Error reported${context ? ` in ${context}` : ''}`, error.toAppError())
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}

// Common error messages
export const ErrorMessages = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  AUTHENTICATION_REQUIRED: 'Please log in to continue.',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  RESOURCE_NOT_FOUND: 'The requested item could not be found.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const
