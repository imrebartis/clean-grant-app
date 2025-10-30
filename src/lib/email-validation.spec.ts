/**
 * Email Validation Utilities Tests
 * Tests for RFC 5322 compliant email validation
 */

import {
  validateEmail,
  validateEmailMemoized,
  debounce,
  clearValidationCache,
} from './email-validation'

describe('validateEmail', () => {
  describe('valid email formats', () => {
    test('returns valid for standard email format', () => {
      expect(validateEmail('founder@company.com')).toEqual({
        isValid: true,
      })
    })

    test('accepts email with subdomain', () => {
      expect(validateEmail('user@mail.company.com')).toEqual({
        isValid: true,
      })
    })

    test('accepts email with numbers', () => {
      expect(validateEmail('user123@company123.com')).toEqual({
        isValid: true,
      })
    })

    test('accepts email with special characters in local part', () => {
      expect(validateEmail('user.name+tag@company.com')).toEqual({
        isValid: true,
      })
    })

    test('accepts email with hyphens in domain', () => {
      expect(validateEmail('user@my-company.com')).toEqual({
        isValid: true,
      })
    })

    test('accepts email with underscores in local part', () => {
      expect(validateEmail('user_name@company.com')).toEqual({
        isValid: true,
      })
    })
  })

  describe('invalid email formats', () => {
    test('returns invalid for missing @ symbol', () => {
      expect(validateEmail('foundercompany.com')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., founder@company.com)',
        ariaLabel: 'Invalid email format. Please enter a valid email address.',
      })
    })

    test('returns invalid for missing domain', () => {
      expect(validateEmail('founder@')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., founder@company.com)',
        ariaLabel: 'Invalid email format. Please enter a valid email address.',
      })
    })

    test('returns invalid for missing local part', () => {
      expect(validateEmail('@company.com')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., founder@company.com)',
        ariaLabel: 'Invalid email format. Please enter a valid email address.',
      })
    })

    test('returns invalid for multiple @ symbols', () => {
      expect(validateEmail('founder@@company.com')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., founder@company.com)',
        ariaLabel: 'Invalid email format. Please enter a valid email address.',
      })
    })

    test('returns invalid for spaces in email', () => {
      expect(validateEmail('founder @company.com')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., founder@company.com)',
        ariaLabel: 'Invalid email format. Please enter a valid email address.',
      })
    })

    test('returns invalid for missing TLD', () => {
      expect(validateEmail('founder@company')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., founder@company.com)',
        ariaLabel: 'Invalid email format. Please enter a valid email address.',
      })
    })
  })

  describe('empty and whitespace handling', () => {
    test('returns invalid for empty string without error message', () => {
      expect(validateEmail('')).toEqual({
        isValid: false,
      })
    })

    test('returns invalid for whitespace only without error message', () => {
      expect(validateEmail('   ')).toEqual({
        isValid: false,
      })
    })

    test('returns invalid for tab and newline characters', () => {
      expect(validateEmail('\t\n')).toEqual({
        isValid: false,
      })
    })
  })

  describe('edge cases', () => {
    test('handles very long email addresses', () => {
      const longEmail = `${'a'.repeat(50)}@${'b'.repeat(50)}.com`
      const result = validateEmail(longEmail)
      expect(result.isValid).toBe(true)
    })

    test('rejects email with consecutive dots in domain', () => {
      expect(validateEmail('user@company..com')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., founder@company.com)',
        ariaLabel: 'Invalid email format. Please enter a valid email address.',
      })
    })

    test('rejects email starting with dot in local part', () => {
      expect(validateEmail('.user@company.com')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., founder@company.com)',
        ariaLabel: 'Invalid email format. Please enter a valid email address.',
      })
    })
  })
})

describe('validateEmailMemoized', () => {
  beforeEach(() => {
    clearValidationCache()
  })

  test('returns same result as validateEmail for valid email', () => {
    const email = 'test@example.com'
    const directResult = validateEmail(email)
    const memoizedResult = validateEmailMemoized(email)

    expect(memoizedResult).toEqual(directResult)
  })

  test('returns same result as validateEmail for invalid email', () => {
    const email = 'invalid-email'
    const expected = validateEmail(email)
    const result = validateEmailMemoized(email)

    expect(result).toEqual(expected)
  })

  test('caches validation results', () => {
    const email = 'test@example.com'

    // First call
    const result1 = validateEmailMemoized(email)

    // Second call should return cached result
    const result2 = validateEmailMemoized(email)

    expect(result1).toEqual(result2)
    expect(result1).toBe(result2) // Same object reference
  })

  test('handles cache size limit', () => {
    // Fill cache beyond limit
    for (let i = 0; i < 150; i++) {
      validateEmailMemoized(`user${i}@example.com`)
    }

    // Should still work without errors
    const result = validateEmailMemoized('final@example.com')
    expect(result.isValid).toBe(true)
  })
})

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('delays function execution', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('test')
    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('test')
  })

  test('cancels previous calls when called multiple times', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('first')
    debouncedFn('second')
    debouncedFn('third')

    jest.advanceTimersByTime(300)

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('third')
  })

  test('handles multiple arguments', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('arg1', 'arg2', 'arg3')
    jest.advanceTimersByTime(300)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })

  test('preserves function context', () => {
    interface TestObject {
      value: string
      method: () => string
    }

    const obj: TestObject = {
      value: 'test',
      method: jest.fn(function (this: TestObject) {
        return this.value
      }),
    }

    const debouncedMethod = debounce(obj.method.bind(obj), 300)
    debouncedMethod()

    jest.advanceTimersByTime(300)
    expect(obj.method).toHaveBeenCalled()
  })
})

describe('clearValidationCache', () => {
  test('clears the validation cache', () => {
    // Add some items to cache
    validateEmailMemoized('test1@example.com')
    validateEmailMemoized('test2@example.com')

    // Clear cache
    clearValidationCache()

    // Should not throw and should work normally
    const result = validateEmailMemoized('test3@example.com')
    expect(result.isValid).toBe(true)
  })
})
