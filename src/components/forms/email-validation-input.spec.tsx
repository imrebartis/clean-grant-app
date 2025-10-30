import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { EmailValidationInput } from './email-validation-input'
import { validateEmail } from '../../lib/email-validation'

// Mock the hook to avoid timer issues in tests
jest.mock('@/hooks/use-email-validation', () => ({
  useEmailValidation: (value: string) => ({
    validationState: validateEmail(value),
    isValidating: false,
    validateEmail: jest.fn(),
  }),
}))

describe('validateEmail', () => {
  test('returns valid for correct email format', () => {
    expect(validateEmail('founder@company.com')).toEqual({
      isValid: true,
    })
  })

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

  test('returns invalid for empty string', () => {
    expect(validateEmail('')).toEqual({
      isValid: false,
    })
  })

  test('returns invalid for whitespace only', () => {
    expect(validateEmail('   ')).toEqual({
      isValid: false,
    })
  })

  test('accepts valid email with subdomain', () => {
    expect(validateEmail('user@mail.company.com')).toEqual({
      isValid: true,
    })
  })

  test('accepts valid email with numbers', () => {
    expect(validateEmail('user123@company123.com')).toEqual({
      isValid: true,
    })
  })
})

describe('EmailValidationInput', () => {
  const defaultProps = {
    id: 'test-email',
    label: 'Email Address',
    value: '',
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders email input with label', () => {
    render(<EmailValidationInput {...defaultProps} />)

    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter your email address')
    ).toBeInTheDocument()
  })

  test('shows required indicator when required prop is true', () => {
    render(<EmailValidationInput {...defaultProps} required={true} />)

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  test('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const mockOnChange = jest.fn()

    render(<EmailValidationInput {...defaultProps} onChange={mockOnChange} />)

    const input = screen.getByLabelText('Email Address')
    await user.type(input, 'test')

    // Should be called for each character typed
    expect(mockOnChange).toHaveBeenCalled()
    expect(mockOnChange).toHaveBeenCalledTimes(4) // 'test' has 4 characters
  })

  test('shows validation error for invalid email', async () => {
    render(<EmailValidationInput {...defaultProps} value="invalid-email" />)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Please enter a valid email address (e.g., founder@company.com)'
        )
      ).toBeInTheDocument()
    })
  })

  test('shows success message for valid email', async () => {
    render(<EmailValidationInput {...defaultProps} value="test@example.com" />)

    await waitFor(() => {
      expect(screen.getByText('Valid email address')).toBeInTheDocument()
    })
  })

  test('applies error styling for invalid email', async () => {
    render(<EmailValidationInput {...defaultProps} value="invalid-email" />)

    const input = screen.getByLabelText('Email Address')

    await waitFor(() => {
      expect(input).toHaveClass('border-destructive')
    })
  })

  test('applies success styling for valid email', async () => {
    render(<EmailValidationInput {...defaultProps} value="test@example.com" />)

    const input = screen.getByLabelText('Email Address')

    await waitFor(() => {
      expect(input).toHaveClass('border-green-500')
    })
  })

  test('shows external error message when provided', () => {
    render(
      <EmailValidationInput {...defaultProps} error="This field is required" />
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  test('calls onBlur when input loses focus', async () => {
    const user = userEvent.setup()
    const mockOnBlur = jest.fn()

    render(<EmailValidationInput {...defaultProps} onBlur={mockOnBlur} />)

    const input = screen.getByLabelText('Email Address')
    await user.click(input)
    await user.tab()

    expect(mockOnBlur).toHaveBeenCalled()
  })

  test('has proper accessibility attributes', () => {
    render(<EmailValidationInput {...defaultProps} value="invalid-email" />)

    const input = screen.getByLabelText('Email Address')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute(
      'aria-describedby',
      'test-email-validation test-email-help'
    )
  })

  test('validation feedback has proper ARIA attributes', async () => {
    render(<EmailValidationInput {...defaultProps} value="invalid-email" />)

    await waitFor(() => {
      const feedback = screen.getByRole('status')
      expect(feedback).toHaveAttribute('aria-live', 'polite')
    })
  })
})
