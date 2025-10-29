import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ApplicationForm } from './application-form'

// Mock the child components
interface MockFormHeaderProps {
  currentStep: number
  progress: number
  lastSaved: Date | null
  isSaving: boolean
}

interface MockFormContentProps {
  currentStepConfig: { id: string }
  formData: Record<string, string>
  errors: Record<string, string>
  onFieldChange: (field: string, value: string) => void
}

interface MockFormNavigationProps {
  currentStep: number
  isLoading: boolean
  isSaving: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

jest.mock('./form-header', () => ({
  FormHeader: ({
    currentStep,
    progress,
    lastSaved,
    isSaving,
  }: MockFormHeaderProps) => (
    <div data-testid="form-header">
      <div>Step: {currentStep}</div>
      <div>Progress: {progress}%</div>
      <div>Last saved: {lastSaved ? 'Yes' : 'No'}</div>
      <div>Saving: {isSaving ? 'Yes' : 'No'}</div>
    </div>
  ),
}))

jest.mock('./form-content', () => ({
  FormContent: ({
    currentStepConfig,
    formData,
    errors,
    onFieldChange,
  }: MockFormContentProps) => (
    <div data-testid="form-content">
      <div>Current step: {currentStepConfig.id}</div>
      <input
        data-testid="test-input"
        value={formData.company_name || ''}
        onChange={e => onFieldChange('company_name', e.target.value)}
      />
      {errors.company_name && (
        <div data-testid="error">{errors.company_name}</div>
      )}
    </div>
  ),
}))

jest.mock('./form-navigation', () => ({
  FormNavigation: ({
    currentStep,
    isLoading,
    isSaving,
    onPrevious,
    onNext,
    onSubmit,
  }: MockFormNavigationProps) => (
    <div data-testid="form-navigation">
      <button onClick={onPrevious} disabled={currentStep === 0}>
        Previous
      </button>
      <button onClick={onNext} disabled={isLoading || isSaving}>
        Next
      </button>
      <button onClick={onSubmit} disabled={isLoading || isSaving}>
        Submit
      </button>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Saving: {isSaving ? 'Yes' : 'No'}</div>
    </div>
  ),
}))

jest.mock('./form-constants', () => ({
  FORM_STEPS: [
    { id: 'step1', title: 'Step 1', fields: ['company_name'] },
    { id: 'step2', title: 'Step 2', fields: ['founder_name'] },
    { id: 'step3', title: 'Step 3', fields: ['founder_email'] },
  ],
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('ApplicationForm', () => {
  const defaultProps = {
    onSave: jest.fn(),
    onSubmit: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders form components', () => {
    render(<ApplicationForm {...defaultProps} />)

    expect(screen.getByTestId('form-header')).toBeInTheDocument()
    expect(screen.getByTestId('form-content')).toBeInTheDocument()
    expect(screen.getByTestId('form-navigation')).toBeInTheDocument()
  })

  test('starts at step 0', () => {
    render(<ApplicationForm {...defaultProps} />)

    expect(screen.getByText('Step: 0')).toBeInTheDocument()
    expect(screen.getByText('Progress: 33.33333333333333%')).toBeInTheDocument()
  })

  test('initializes with provided data', () => {
    const initialData = { company_name: 'Test Company' }

    render(<ApplicationForm {...defaultProps} initialData={initialData} />)

    const input = screen.getByTestId('test-input')
    expect(input).toHaveValue('Test Company')
  })

  test('updates form data when field changes', async () => {
    const user = userEvent.setup()

    render(<ApplicationForm {...defaultProps} />)

    const input = screen.getByTestId('test-input')
    await user.type(input, 'New Company')

    expect(input).toHaveValue('New Company')
  })

  test('advances to next step when Next is clicked', async () => {
    const user = userEvent.setup()

    render(<ApplicationForm {...defaultProps} />)

    // Fill required field
    const input = screen.getByTestId('test-input')
    await user.type(input, 'Test Company')

    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Step: 1')).toBeInTheDocument()
    })
  })

  test('goes to previous step when Previous is clicked', async () => {
    const user = userEvent.setup()

    render(<ApplicationForm {...defaultProps} />)

    // First advance to step 1
    const input = screen.getByTestId('test-input')
    await user.type(input, 'Test Company')

    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Step: 1')).toBeInTheDocument()
    })

    // Then go back
    const previousButton = screen.getByText('Previous')
    await user.click(previousButton)

    await waitFor(() => {
      expect(screen.getByText('Step: 0')).toBeInTheDocument()
    })
  })

  test('calls onSave when advancing steps', async () => {
    const user = userEvent.setup()
    const mockOnSave = jest.fn().mockResolvedValue(undefined)

    render(<ApplicationForm {...defaultProps} onSave={mockOnSave} />)

    const input = screen.getByTestId('test-input')
    await user.type(input, 'Test Company')

    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          company_name: 'Test Company',
        })
      )
    })
  })

  test('calls onSubmit when Submit is clicked', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined)

    // Initialize with complete form data to pass validation
    const completeData = {
      company_name: 'Test Company',
      founder_name: 'John Doe',
      founder_email: 'john@example.com',
      business_description: 'Test business description',
      environmental_problem: 'Test environmental problem',
      business_model: 'Test business model',
      key_achievements: 'Test achievements',
      funding_use: 'Test funding use',
      future_goals: 'Test future goals',
      competitors: 'Test competitors',
      unique_positioning: 'Test positioning',
    }

    render(
      <ApplicationForm
        {...defaultProps}
        onSubmit={mockOnSubmit}
        initialData={completeData}
      />
    )

    const submitButton = screen.getByText('Submit')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  test('shows saving state during save operations', async () => {
    const user = userEvent.setup()
    const mockOnSave = jest.fn(
      () => new Promise<void>(resolve => setTimeout(resolve, 100))
    )

    render(<ApplicationForm {...defaultProps} onSave={mockOnSave} />)

    const input = screen.getByTestId('test-input')
    await user.type(input, 'Test Company')

    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    // Should show saving state - use getAllByText to handle multiple elements
    expect(screen.getAllByText('Saving: Yes')).toHaveLength(2)

    await waitFor(() => {
      expect(screen.getAllByText('Saving: No')).toHaveLength(2)
    })
  })

  test('shows loading state during submission', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn(
      () => new Promise<void>(resolve => setTimeout(resolve, 100))
    )

    // Initialize with complete form data to pass validation
    const completeData = {
      company_name: 'Test Company',
      founder_name: 'John Doe',
      founder_email: 'john@example.com',
      business_description: 'Test business description',
      environmental_problem: 'Test environmental problem',
      business_model: 'Test business model',
      key_achievements: 'Test achievements',
      funding_use: 'Test funding use',
      future_goals: 'Test future goals',
      competitors: 'Test competitors',
      unique_positioning: 'Test positioning',
    }

    render(
      <ApplicationForm
        {...defaultProps}
        onSubmit={mockOnSubmit}
        initialData={completeData}
      />
    )

    const submitButton = screen.getByText('Submit')
    await user.click(submitButton)

    // Should show loading state
    expect(screen.getByText('Loading: Yes')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Loading: No')).toBeInTheDocument()
    })
  })

  test('updates progress as steps advance', async () => {
    const user = userEvent.setup()

    render(<ApplicationForm {...defaultProps} />)

    // Step 0 - 33.33%
    expect(screen.getByText('Progress: 33.33333333333333%')).toBeInTheDocument()

    // Advance to step 1
    const input = screen.getByTestId('test-input')
    await user.type(input, 'Test Company')

    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    await waitFor(() => {
      expect(
        screen.getByText('Progress: 66.66666666666666%')
      ).toBeInTheDocument()
    })
  })

  test('prevents navigation when validation fails', async () => {
    const user = userEvent.setup()

    render(<ApplicationForm {...defaultProps} />)

    // Try to advance without filling required field
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    // Should stay on step 0
    expect(screen.getByText('Step: 0')).toBeInTheDocument()
  })

  test('shows validation errors', async () => {
    const user = userEvent.setup()

    render(<ApplicationForm {...defaultProps} />)

    // Try to advance without filling required field
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
    })
  })

  test('clears errors when field is corrected', async () => {
    const user = userEvent.setup()

    render(<ApplicationForm {...defaultProps} />)

    // Trigger validation error
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
    })

    // Fix the error
    const input = screen.getByTestId('test-input')
    await user.type(input, 'Test Company')

    await waitFor(() => {
      expect(screen.queryByTestId('error')).not.toBeInTheDocument()
    })
  })

  test('handles applicationId prop', () => {
    const applicationId = 'test-app-id'

    render(<ApplicationForm {...defaultProps} applicationId={applicationId} />)

    // Should render without errors
    expect(screen.getByTestId('form-header')).toBeInTheDocument()
  })
})
