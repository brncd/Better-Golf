/**
 * Centralized logging utility for the Better Golf application
 */

import { config } from './config'

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const logLevelMap: Record<string, LogLevel> = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG,
}

class Logger {
  private currentLevel: LogLevel

  constructor() {
    this.currentLevel = logLevelMap[config.development.logLevel] ?? LogLevel.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`
    }
    
    return `${prefix} ${message}`
  }

  error(message: string, error?: Error | any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return

    const errorData = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : error

    console.error(this.formatMessage('error', message, errorData))
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    console.warn(this.formatMessage('warn', message, data))
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    console.info(this.formatMessage('info', message, data))
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    console.debug(this.formatMessage('debug', message, data))
  }

  // API-specific logging methods
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, data)
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    this.debug(`API Response: ${method} ${url} - ${status}`, data)
  }

  apiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method} ${url}`, error)
  }

  // Authentication logging
  authSuccess(action: string, user?: any): void {
    this.info(`Auth Success: ${action}`, user ? { id: user.id, email: user.email } : undefined)
  }

  authFailure(action: string, error: any): void {
    this.warn(`Auth Failure: ${action}`, error)
  }

  // Navigation logging
  navigation(from: string, to: string): void {
    this.debug(`Navigation: ${from} -> ${to}`)
  }
}

export const logger = new Logger()

// Error boundary logging helper
export const logErrorBoundary = (error: Error, errorInfo: any) => {
  logger.error('React Error Boundary caught an error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    errorInfo,
  })
}
