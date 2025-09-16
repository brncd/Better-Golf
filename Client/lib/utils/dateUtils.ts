/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth as ISO string
 * @returns Age in years or null if invalid date
 */
export const calculateAge = (dateOfBirth?: string): number | null => {
  if (!dateOfBirth) return null
  
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  
  // Check if the date is valid
  if (isNaN(birthDate.getTime())) return null
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Format date for display
 * @param dateString - Date as ISO string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return "Not provided"
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  
  return new Date(dateString).toLocaleDateString("en-US", options || defaultOptions)
}

/**
 * Check if a date is in the past
 * @param dateString - Date as ISO string
 * @returns True if date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  return new Date(dateString) < new Date()
}

/**
 * Check if a date is in the future
 * @param dateString - Date as ISO string
 * @returns True if date is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
  return new Date(dateString) > new Date()
}

/**
 * Get days between two dates
 * @param startDate - Start date as ISO string
 * @param endDate - End date as ISO string
 * @returns Number of days between dates
 */
export const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
