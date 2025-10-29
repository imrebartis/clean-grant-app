import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { FormNavigation } from './form-navigation'

// Mock the form constants
jest.mock('./form-constants', () => ({
  FORM_STEPS: [
    { id: 'step1', title: 'Step 1' },
    { id: 'step2', title: 'Step 2' },
    { id: 'step3', title: 'Step 3' },
  ],
}))

describe('FormNavigation', () => {
  const defaultProps = {
    currentStep: 1,
    isLoading: false,
    isSaving: false,
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    onSubmit: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders navigation buttons', () => {
    render(<FormNavigation {...defaultProps} />)

    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  test('shows progress indicator', () => {
    render(<FormNavigation {...defaultProps} />)

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
  })

  test('disables Previous button on first step', () => {
    render(<FormNavigation {...defaultProps} currentStep={0} />)

    const previousButton = screen.getByText('Previous')
    expect(previousButton).toBeDisabled()
  })

  test('enables Previous button on non-first step', () => {
    render(<FormNavigation {...defaultProps} currentStep={1} />)

    const previousButton = screen.getByText('Previous')
    expect(previousButton).not.toBeDisabled()
  })

  test('shows Submit button on last step', () => {
    render(<FormNavigation {...defaultProps} currentStep={2} />)

    expect(screen.getByText('Submit Application')).toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  test('calls onPrevious when Previous button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnPrevious = jest.fn()

    render(<FormNavigation {...defaultProps} onPrevious={mockOnPrevious} />)

    const previousButton = screen.getByText('Previous')
    await user.click(previousButton)

    expect(mockOnPrevious).toHaveBeenCalled()
  })

  test('calls onNext when Next button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnNext = jest.fn()

    render(<FormNavigation {...defaultProps} onNext={mockOnNext} />)

    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    expect(mockOnNext).toHaveBeenCalled()
  })

  test('calls onSubmit when Submit button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn()

    render(
      <FormNavigation
        {...defaultProps}
        currentStep={2}
        onSubmit={mockOnSubmit}
      />
    )

    const submitButton = screen.getByText('Submit Application')
    await user.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalled()
  })

  test('shows loading state on Submit button', () => {
    render(
      <FormNavigation {...defaultProps} currentStep={2} isLoading={true} />
    )

    expect(screen.getByText('Submitting...')).toBeInTheDocument()
  })

  test('shows saving state on Next button', () => {
    render(<FormNavigation {...defaultProps} isSaving={true} />)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  test('shows saving state on Submit button', () => {
    render(<FormNavigation {...defaultProps} currentStep={2} isSaving={true} />)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  test('disables buttons when loading', () => {
    render(<FormNavigation {...defaultProps} isLoading={true} />)

    expect(screen.getByText('Previous')).toBeDisabled()
    expect(screen.getByText('Next')).toBeDisabled()
  })

  test('disables buttons when saving', () => {
    render(<FormNavigation {...defaultProps} isSaving={true} />)

    expect(screen.getByText('Previous')).toBeDisabled()
    expect(screen.getByText('Saving...')).toBeDisabled()
  })

  test('progress bar shows correct width', () => {
    render(<FormNavigation {...defaultProps} currentStep={1} />)

    // Find the progress bar by its class and style
    const progressBar = document.querySelector('.h-full.bg-primary')
    expect(progressBar).toHaveStyle('width: 66.66666666666666%') // Step 2 of 3
  })

  test('progress bar updates with step changes', () => {
    const { rerender } = render(
      <FormNavigation {...defaultProps} currentStep={0} />
    )

    let progressBar = document.querySelector('.h-full.bg-primary')
    expect(progressBar).toHaveStyle('width: 33.33333333333333%') // Step 1 of 3

    rerender(<FormNavigation {...defaultProps} currentStep={2} />)

    progressBar = document.querySelector('.h-full.bg-primary')
    expect(progressBar).toHaveStyle('width: 100%') // Step 3 of 3
  })

  test('hides progress indicator on small screens', () => {
    render(<FormNavigation {...defaultProps} />)

    const progressContainer = screen.getByText('Step 2 of 3').parentElement
    expect(progressContainer).toHaveClass('hidden', 'sm:flex')
  })
})
