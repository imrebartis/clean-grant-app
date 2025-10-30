/**
 * Email Validation Utilities
 * RFC 5322 compliant email validation with performance optimizations
 */

export interface EmailValidationResult {
  isValid: boolean
  error?: string
  ariaLabel?: string
}

/**
 * RFC 5322 compliant email validation
 * Validates email format according to RFC 5322 specification
 */
export function validateEmail(email: string): EmailValidationResult {
  // Empty field handling - don't show validation messages for empty fields
  if (!email.trim()) {
    return { isValid: false }
  }

  // RFC 5322 compliant email validation pattern
  // Rejects emails that start with a dot in the local part
  const emailRegex =
    /^[a-zA-Z0-9](?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., founder@company.com)',
      ariaLabel: 'Invalid email format. Please enter a valid email address.',
    }
  }

  return { isValid: true }
}

/**
 * Debounce utility for email validation
 * Prevents excessive validation calls during typing
 * @template T - The function type to debounce
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Memoized email validation for performance
 * Caches validation results to avoid repeated regex operations
 */
const validationCache = new Map<string, EmailValidationResult>()
const MAX_CACHE_SIZE = 100

export function validateEmailMemoized(email: string): EmailValidationResult {
  // Check cache first
  if (validationCache.has(email)) {
    return validationCache.get(email)!
  }

  // Validate and cache result
  const result = validateEmail(email)

  // Prevent cache from growing too large
  if (validationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = validationCache.keys().next().value
    if (firstKey !== undefined) {
      validationCache.delete(firstKey)
    }
  }

  validationCache.set(email, result)
  return result
}

/**
 * Clear validation cache (useful for testing)
 */
export function clearValidationCache(): void {
  validationCache.clear()
}
