// Environment variable access utility
// This file provides safe access to environment variables on both client and server

export const getEnvVar = (key: string, defaultValue?: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side: access Next.js environment variables
    if (key.startsWith('NEXT_PUBLIC_')) {
      return (process.env as any)[key] || defaultValue || ''
    }
    return defaultValue || ''
  }
  
  // Server-side: full process.env access
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key]
    if (!value && !defaultValue) {
      console.warn(`Environment variable ${key} is not set, using default`)
      return defaultValue || ''
    }
    return value || defaultValue!
  }
  
  return defaultValue || ''
}

export const getBooleanEnvVar = (key: string, defaultValue: boolean): boolean => {
  const value = getEnvVar(key)
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

export const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key)
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    console.warn(`Environment variable ${key} must be a valid number, using default`)
    return defaultValue
  }
  return parsed
}
