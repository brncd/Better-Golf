/**
 * Environment configuration for the Better Golf application
 */

export interface AppConfig {
  api: {
    baseUrl: string
    timeout: number
  }
  auth: {
    jwtExpiryHours: number
  }
  app: {
    name: string
    version: string
  }
  features: {
    enableRegistration: boolean
    enableGuestAccess: boolean
    enableNotifications: boolean
  }
  development: {
    debugMode: boolean
    logLevel: 'error' | 'warn' | 'info' | 'debug'
  }
  external: {
    googleMapsApiKey?: string
    analyticsId?: string
  }
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  return value || defaultValue!
}

const getBooleanEnvVar = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`)
  }
  return parsed
}

export const config: AppConfig = {
  api: {
    baseUrl: getEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:5000'),
    timeout: getNumberEnvVar('NEXT_PUBLIC_API_TIMEOUT', 30000),
  },
  auth: {
    jwtExpiryHours: getNumberEnvVar('NEXT_PUBLIC_JWT_EXPIRY_HOURS', 24),
  },
  app: {
    name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'Better Golf'),
    version: getEnvVar('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
  },
  features: {
    enableRegistration: getBooleanEnvVar('NEXT_PUBLIC_ENABLE_REGISTRATION', true),
    enableGuestAccess: getBooleanEnvVar('NEXT_PUBLIC_ENABLE_GUEST_ACCESS', false),
    enableNotifications: getBooleanEnvVar('NEXT_PUBLIC_ENABLE_NOTIFICATIONS', true),
  },
  development: {
    debugMode: getBooleanEnvVar('NEXT_PUBLIC_DEBUG_MODE', false),
    logLevel: (getEnvVar('NEXT_PUBLIC_LOG_LEVEL', 'info') as AppConfig['development']['logLevel']),
  },
  external: {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  },
}

// Validate critical configuration on startup
export const validateConfig = (): void => {
  try {
    // Validate API base URL format
    new URL(config.api.baseUrl)
  } catch {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must be a valid URL')
  }

  // Validate log level
  const validLogLevels = ['error', 'warn', 'info', 'debug']
  if (!validLogLevels.includes(config.development.logLevel)) {
    throw new Error(`NEXT_PUBLIC_LOG_LEVEL must be one of: ${validLogLevels.join(', ')}`)
  }

  // Log configuration in development
  if (config.development.debugMode) {
    console.log('App Configuration:', {
      ...config,
      // Don't log sensitive data
      external: {
        googleMapsApiKey: config.external.googleMapsApiKey ? '[SET]' : '[NOT SET]',
        analyticsId: config.external.analyticsId ? '[SET]' : '[NOT SET]',
      },
    })
  }
}
