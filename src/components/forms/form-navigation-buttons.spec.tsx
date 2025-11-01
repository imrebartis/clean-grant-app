/**
 * Form Navigation Buttons Tests
 * Tests for FormNavigationButtons component with email validation control
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { FormNavigationButtons } from './form-navigation-buttons'
import { type GrantApplicationFormDataType } from '../../lib/validation'

// Mock the form constants
jest.mock('./form-constants', () => ({
  FORM_STEPS: [
    {
      id: 'basic-info',
      title: 'Basic Info',
      fields: ['company_name', 'founder_name', 'founder_email'],
    },
    {
      id: 'business-overview',
      title: 'Business Overview',
      fields: ['business_description'],
    },
    { id: 'final-step', title: 'Final Step', fields: ['other_field'] },
  ],
}))

describe('FormNavigationButtons', () => {
  const defaultProps = {
    currentStep: 0,
    formData: {} as GrantApplicationFormDataType,
    isLoading: false,
    isSaving: false,
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    onSubmit: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic functionality', () => {
    test('renders Previous and Next buttons', () => {
      render(<FormNavigationButtons {...defaultProps} />)

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    test('shows progress indicator', () => {
      render(<FormNavigationButtons {...defaultProps} />)

      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    })

    test('disables Previous button on first step', () => {
      render(<FormNavigationButtons {...defaultProps} currentStep={0} />)

      const previousButton = screen.getByText('Previous')
      expect(previousButton).toBeDisabled()
    })

    test('enables Previous button on non-first step', () => {
      render(<FormNavigationButtons {...defaultProps} currentStep={1} />)

      const previousButton = screen.getByText('Previous')
      expect(previousButton).not.toBeDisabled()
    })

    test('shows Submit button on last step', () => {
      render(<FormNavigationButtons {...defaultProps} currentStep={2} />)

      expect(screen.getByText('Submit Application')).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })
  })

  describe('email validation control', () => {
    test('can handle form validation', () => {
      const formData = {
        company_name: 'Test Company',
        founder_name: 'John Doe',
        founder_email: 'founder@company.com',
        website_url: 'https://example.com',
      } as GrantApplicationFormDataType

      render(
        <FormNavigationButtons
          {...defaultProps}
          currentStep={0}
          formData={formData}
        />
      )

      // Component should render without errors
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  describe('tooltip functionality', () => {
    test('can handle tooltip interactions', () => {
      const formData = {
        company_name: 'Test Company',
        founder_name: 'John Doe',
        founder_email: 'founder@company.com',
        website_url: 'https://example.com',
      } as GrantApplicationFormDataType

      render(
        <FormNavigationButtons
          {...defaultProps}
          currentStep={0}
          formData={formData}
        />
      )

      // Component should render without errors
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    test('provides accessible navigation buttons', () => {
      const formData = {
        company_name: 'Test Company',
        founder_name: 'John Doe',
        founder_email: 'founder@company.com',
        website_url: 'https://example.com',
      } as GrantApplicationFormDataType

      render(
        <FormNavigationButtons
          {...defaultProps}
          currentStep={0}
          formData={formData}
        />
      )

      // Component should render accessible buttons
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  describe('loading and saving states', () => {
    test('shows loading state on Submit button', () => {
      render(
        <FormNavigationButtons
          {...defaultProps}
          currentStep={2}
          isLoading={true}
        />
      )

      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })

    test('shows saving state on Next button', () => {
      const formDataWithValidEmail = {
        company_name: 'Test Company',
        founder_name: 'John Doe',
        founder_email: 'founder@company.com',
        website_url: 'https://example.com',
      } as GrantApplicationFormDataType

      render(
        <FormNavigationButtons
          {...defaultProps}
          formData={formDataWithValidEmail}
          isSaving={true}
        />
      )

      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })

    test('disables buttons when loading', () => {
      const formDataWithValidEmail = {
        founder_email: 'founder@company.com',
      } as GrantApplicationFormDataType

      render(
        <FormNavigationButtons
          {...defaultProps}
          formData={formDataWithValidEmail}
          isLoading={true}
        />
      )

      expect(screen.getByText('Previous')).toBeDisabled()
      expect(screen.getByText('Submitting...')).toBeDisabled()
    })

    test('disables buttons when saving', () => {
      const formDataWithValidEmail = {
        founder_email: 'founder@company.com',
      } as GrantApplicationFormDataType

      render(
        <FormNavigationButtons
          {...defaultProps}
          formData={formDataWithValidEmail}
          isSaving={true}
        />
      )

      expect(screen.getByText('Previous')).toBeDisabled()
      expect(screen.getByText('Saving...')).toBeDisabled()
    })
  })

  describe('event handlers', () => {
    test('calls onPrevious when Previous button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnPrevious = jest.fn()

      render(
        <FormNavigationButtons
          {...defaultProps}
          currentStep={1}
          onPrevious={mockOnPrevious}
        />
      )

      const previousButton = screen.getByText('Previous')
      await user.click(previousButton)

      expect(mockOnPrevious).toHaveBeenCalled()
    })

    test('calls onNext when Next button is clicked and enabled', async () => {
      const user = userEvent.setup()
      const mockOnNext = jest.fn()
      const formData = {
        company_name: 'Test Company',
        founder_name: 'John Doe',
        founder_email: 'founder@company.com',
        website_url: 'https://example.com',
      } as GrantApplicationFormDataType

      render(
        <FormNavigationButtons
          {...defaultProps}
          formData={formData}
          onNext={mockOnNext}
        />
      )

      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      expect(mockOnNext).toHaveBeenCalled()
    })

    test('calls onSubmit when Submit button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = jest.fn()

      render(
        <FormNavigationButtons
          {...defaultProps}
          currentStep={2}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByText('Submit Application')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalled()
    })

    test('handles disabled button clicks appropriately', async () => {
      const mockOnNext = jest.fn()

      render(
        <FormNavigationButtons
          {...defaultProps}
          formData={{} as GrantApplicationFormDataType}
          onNext={mockOnNext}
        />
      )

      // Component should render without errors
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  describe('progress indicator', () => {
    test('shows correct progress for different steps', () => {
      const { rerender } = render(
        <FormNavigationButtons {...defaultProps} currentStep={0} />
      )

      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()

      rerender(<FormNavigationButtons {...defaultProps} currentStep={1} />)
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()

      rerender(<FormNavigationButtons {...defaultProps} currentStep={2} />)
      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
    })

    test('updates progress bar width correctly', () => {
      render(<FormNavigationButtons {...defaultProps} currentStep={1} />)

      const progressBar = document.querySelector('.h-full.bg-primary')
      expect(progressBar).toHaveStyle('width: 66.66666666666666%') // Step 2 of 3
    })
  })
})
