"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, X } from "lucide-react"
import { BetterGolfError, ErrorType, getErrorMessage } from "@/lib/errors"

interface ErrorDisplayProps {
  error: BetterGolfError | Error | string | null
  onRetry?: () => void
  onDismiss?: () => void
  variant?: "alert" | "card" | "inline"
  showDetails?: boolean
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  variant = "alert",
  showDetails = false 
}: ErrorDisplayProps) {
  if (!error) return null

  const errorMessage = getErrorMessage(error)
  const isRetryable = error instanceof BetterGolfError && 
    [ErrorType.NETWORK, ErrorType.SERVER].includes(error.type)

  const getErrorIcon = () => {
    if (error instanceof BetterGolfError) {
      switch (error.type) {
        case ErrorType.NETWORK:
          return <AlertTriangle className="h-4 w-4" />
        case ErrorType.AUTHENTICATION:
        case ErrorType.AUTHORIZATION:
          return <AlertTriangle className="h-4 w-4" />
        default:
          return <AlertTriangle className="h-4 w-4" />
      }
    }
    return <AlertTriangle className="h-4 w-4" />
  }

  const getErrorTitle = () => {
    if (error instanceof BetterGolfError) {
      switch (error.type) {
        case ErrorType.NETWORK:
          return "Connection Error"
        case ErrorType.AUTHENTICATION:
          return "Authentication Required"
        case ErrorType.AUTHORIZATION:
          return "Access Denied"
        case ErrorType.VALIDATION:
          return "Validation Error"
        case ErrorType.NOT_FOUND:
          return "Not Found"
        case ErrorType.SERVER:
          return "Server Error"
        default:
          return "Error"
      }
    }
    return "Error"
  }

  const renderAlert = () => (
    <Alert variant="destructive" className="relative">
      <div className="flex items-start gap-2">
        {getErrorIcon()}
        <div className="flex-1">
          <AlertTitle>{getErrorTitle()}</AlertTitle>
          <AlertDescription className="mt-1">
            {errorMessage}
          </AlertDescription>
          {showDetails && error instanceof BetterGolfError && error.details && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Technical details
              </summary>
              <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
          <div className="flex gap-2 mt-3">
            {onRetry && isRetryable && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  )

  const renderCard = () => (
    <Card className="border-destructive">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          {getErrorIcon()}
          {getErrorTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        {showDetails && error instanceof BetterGolfError && error.details && (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">
              Technical details
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}
        <div className="flex gap-2">
          {onRetry && isRetryable && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderInline = () => (
    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
      {getErrorIcon()}
      <span className="flex-1">{errorMessage}</span>
      {onRetry && isRetryable && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="h-6 px-2">
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
      {onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss} className="h-6 px-2">
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )

  switch (variant) {
    case "card":
      return renderCard()
    case "inline":
      return renderInline()
    default:
      return renderAlert()
  }
}
