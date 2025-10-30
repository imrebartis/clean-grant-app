/**
 * Email Validation Hook Tests
 * Tests for useEmailValidation custom hook
 */

import { renderHook, act } from '@testing-library/react'
import { useEmailValidation } from './use-email-validation'
import { clearValidationCache } from '../lib/email-validation'

// Mock timers for debounce testing
jest.useFakeTimers()

describe('useEmailValidation', () => {
  beforeEach(() => {
    clearValidationCache()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
  })

  describe('initialization', () => {
    test('initializes with valid state for empty email', () => {
      const { result } = renderHook(() => useEmailValidation(''))

      expect(result.current.validationState.isValid).toBe(true)
      expect(result.current.isValidating).toBe(false)
    })

    test('validates initial email when validateOnMount is true', () => {
      const { result } = renderHook(() =>
        useEmailValidation('test@example.com', { validateOnMount: true })
      )

      expect(result.current.validationState.isValid).toBe(true)
      expect(result.current.isValidating).toBe(false)
    })

    test('validates invalid initial email when validateOnMount is true', () => {
      const { result } = renderHook(() =>
        useEmailValidation('invalid-email', { validateOnMount: true })
      )

      expect(result.current.validationState.isValid).toBe(false)
      expect(result.current.validationState.error).toBeDefined()
    })

    test('skips initial validation when validateOnMount is false', () => {
      const { result } = renderHook(() =>
        useEmailValidation('invalid-email', { validateOnMount: false })
      )

      expect(result.current.validationState.isValid).toBe(true)
    })
  })

  describe('debounced validation', () => {
    test('debounces validation calls by default 300ms', async () => {
      const { result } = renderHook(() =>
        useEmailValidation('', { validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('invalid-email')
      })

      // Should be validating immediately
      expect(result.current.isValidating).toBe(true)
      expect(result.current.validationState.isValid).toBe(true) // Still old state

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(300)
      })

      // Should have completed validation
      expect(result.current.isValidating).toBe(false)
      expect(result.current.validationState.isValid).toBe(false)
    })

    test('uses custom debounce delay', async () => {
      const { result } = renderHook(() =>
        useEmailValidation('', { debounceMs: 500, validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('test@example.com')
      })

      expect(result.current.isValidating).toBe(true)

      // Should not complete after 300ms
      act(() => {
        jest.advanceTimersByTime(300)
      })
      expect(result.current.isValidating).toBe(true)

      // Should complete after 500ms
      act(() => {
        jest.advanceTimersByTime(200)
      })
      expect(result.current.isValidating).toBe(false)
      expect(result.current.validationState.isValid).toBe(true)
    })

    test('cancels previous validation when called multiple times', async () => {
      const { result } = renderHook(() =>
        useEmailValidation('', { validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('invalid-email')
        result.current.validateEmail('test@example.com')
      })

      expect(result.current.isValidating).toBe(true)

      act(() => {
        jest.advanceTimersByTime(300)
      })

      // Should validate the last email only
      expect(result.current.isValidating).toBe(false)
      expect(result.current.validationState.isValid).toBe(true)
    })
  })

  describe('immediate validation', () => {
    test('validates immediately when immediate flag is true', () => {
      const { result } = renderHook(() =>
        useEmailValidation('', { validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('invalid-email', true)
      })

      // Should complete immediately without waiting for debounce
      expect(result.current.isValidating).toBe(false)
      expect(result.current.validationState.isValid).toBe(false)
    })

    test('cancels pending debounced validation when immediate validation is called', () => {
      const { result } = renderHook(() =>
        useEmailValidation('', { validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('first-email')
        result.current.validateEmail('test@example.com', true)
      })

      // Should complete immediately with the immediate validation
      expect(result.current.isValidating).toBe(false)
      expect(result.current.validationState.isValid).toBe(true)

      // Advancing time should not trigger the debounced validation
      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current.validationState.isValid).toBe(true)
    })
  })

  describe('validation results', () => {
    test('returns valid result for correct email', () => {
      const { result } = renderHook(() =>
        useEmailValidation('', { validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('founder@company.com', true)
      })

      expect(result.current.validationState).toEqual({
        isValid: true,
      })
    })

    test('returns invalid result with error message for incorrect email', () => {
      const { result } = renderHook(() =>
        useEmailValidation('', { validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('invalid-email', true)
      })

      expect(result.current.validationState).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., founder@company.com)',
        ariaLabel: 'Invalid email format. Please enter a valid email address.',
      })
    })

    test('returns invalid without error for empty email', () => {
      const { result } = renderHook(() =>
        useEmailValidation('', { validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('', true)
      })

      expect(result.current.validationState).toEqual({
        isValid: false,
      })
    })
  })

  describe('clearValidation', () => {
    test('clears validation state and cancels pending validation', () => {
      const { result } = renderHook(() =>
        useEmailValidation('', { validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('invalid-email', true)
      })

      expect(result.current.validationState.isValid).toBe(false)

      act(() => {
        result.current.clearValidation()
      })

      expect(result.current.validationState.isValid).toBe(true)
      expect(result.current.isValidating).toBe(false)
    })

    test('cancels pending debounced validation', () => {
      const { result } = renderHook(() =>
        useEmailValidation('', { validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('invalid-email')
        result.current.clearValidation()
      })

      expect(result.current.isValidating).toBe(false)
      expect(result.current.validationState.isValid).toBe(true)

      // Advancing time should not trigger validation
      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current.validationState.isValid).toBe(true)
    })
  })

  describe('cleanup', () => {
    test('cleans up timeout on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useEmailValidation('', { validateOnMount: false })
      )

      act(() => {
        result.current.validateEmail('test@example.com')
      })

      expect(result.current.isValidating).toBe(true)

      unmount()

      // Should not throw errors when advancing timers after unmount
      expect(() => {
        act(() => {
          jest.advanceTimersByTime(300)
        })
      }).not.toThrow()
    })
  })

  describe('initial email changes', () => {
    test('revalidates when initial email changes and validateOnMount is true', () => {
      const { result, rerender } = renderHook(
        ({ email }) => useEmailValidation(email, { validateOnMount: true }),
        { initialProps: { email: 'test@example.com' } }
      )

      expect(result.current.validationState.isValid).toBe(true)

      rerender({ email: 'invalid-email' })

      expect(result.current.validationState.isValid).toBe(false)
    })

    test('does not revalidate when validateOnMount is false', () => {
      const { result, rerender } = renderHook(
        ({ email }) => useEmailValidation(email, { validateOnMount: false }),
        { initialProps: { email: 'test@example.com' } }
      )

      expect(result.current.validationState.isValid).toBe(true)

      rerender({ email: 'invalid-email' })

      expect(result.current.validationState.isValid).toBe(true) // Should not change
    })
  })
})
