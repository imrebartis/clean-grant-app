import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FormField } from './form-field'

// Mock the child components
interface MockEmailValidationInputProps {
  id: string
  value: string
  onChange: (value: string) => void
}

interface MockFileUploadProps {
  id: string
  onChange: (value: string) => void
}

jest.mock('./email-validation-input', () => ({
  EmailValidationInput: ({
    id,
    value,
    onChange,
  }: MockEmailValidationInputProps) => (
    <div data-testid="email-validation-input">
      <input
        id={id}
        type="email"
        value={value}
        onChange={e => onChange(e.target.value)}
        data-testid="email-input"
      />
    </div>
  ),
}))

jest.mock('./file-upload', () => ({
  FileUpload: ({ id, onChange }: MockFileUploadProps) => (
    <div data-testid="file-upload">
      <input
        id={id}
        type="file"
        onChange={e => onChange(e.target.value)}
        data-testid="file-input"
      />
    </div>
  ),
}))

describe('FormField', () => {
  const defaultProps = {
    field: 'test_field',
    value: '',
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders regular input field', () => {
    render(<FormField {...defaultProps} />)

    expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter your test field')
    ).toBeInTheDocument()
  })

  test('formats field label correctly', () => {
    render(<FormField {...defaultProps} field="company_name" />)

    // Check that the label text is formatted correctly by looking for the text content
    expect(screen.getByText('Company Name')).toBeInTheDocument()
    // Also verify the input is properly labeled by checking it exists with the correct id
    expect(
      screen.getByRole('textbox', { name: /company name/i })
    ).toBeInTheDocument()
  })

  test('renders email validation input for email fields', () => {
    render(<FormField {...defaultProps} field="founder_email" />)

    expect(screen.getByTestId('email-validation-input')).toBeInTheDocument()
  })

  test('renders file upload for financial statements field', () => {
    render(<FormField {...defaultProps} field="financial_statements_url" />)

    expect(screen.getByTestId('file-upload')).toBeInTheDocument()
  })

  test('renders textarea for fields with questions', () => {
    render(
      <FormField
        {...defaultProps}
        field="business_description"
        question="Describe your business in 2 minutes"
      />
    )

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Answer: Describe your business in 2 minutes')
    ).toBeInTheDocument()
  })

  test('shows question as helper text', () => {
    render(
      <FormField {...defaultProps} question="What is your business model?" />
    )

    // The question appears in the placeholder text, not as standalone text
    expect(
      screen.getByPlaceholderText('Answer: What is your business model?')
    ).toBeInTheDocument()
  })

  test('calls onChange when input value changes', async () => {
    const mockOnChange = jest.fn()

    render(<FormField {...defaultProps} onChange={mockOnChange} />)

    const input = screen.getByLabelText('Test Field')

    // Simulate typing by directly changing the input value
    fireEvent.change(input, { target: { value: 'test value' } })

    expect(mockOnChange).toHaveBeenCalledWith('test value')
  })

  test('shows error message', () => {
    render(<FormField {...defaultProps} error="This field is required" />)

    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  test('applies error styling to input', () => {
    render(<FormField {...defaultProps} error="Invalid input" />)

    const input = screen.getByLabelText('Test Field')
    expect(input).toHaveClass('border-destructive')
  })

  test('does not show label for email fields', () => {
    render(<FormField {...defaultProps} field="founder_email" />)

    // Email validation input handles its own label
    expect(screen.queryByText('Founder Email')).not.toBeInTheDocument()
  })

  test('does not show label for file upload fields', () => {
    render(<FormField {...defaultProps} field="financial_statements_url" />)

    // File upload handles its own label
    expect(
      screen.queryByText('Financial Statements Url')
    ).not.toBeInTheDocument()
  })

  test('does not show error for email fields', () => {
    render(
      <FormField
        {...defaultProps}
        field="founder_email"
        error="This field is required"
      />
    )

    // Email validation input handles its own errors
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  test('does not show error for file upload fields', () => {
    render(
      <FormField
        {...defaultProps}
        field="financial_statements_url"
        error="This field is required"
      />
    )

    // File upload handles its own errors
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  describe('textarea fields', () => {
    test('shows character count', () => {
      render(
        <FormField
          {...defaultProps}
          field="business_description"
          question="Describe your business"
          value="Test description"
        />
      )

      expect(screen.getByText('16 characters')).toBeInTheDocument()
    })

    test('shows writing guidance for short text', () => {
      render(
        <FormField
          {...defaultProps}
          field="business_description"
          question="Describe your business"
          value="Short"
        />
      )

      expect(
        screen.getByText('Consider adding more detail')
      ).toBeInTheDocument()
    })

    test('shows success message for good length text', () => {
      const longText =
        'This is a detailed business description that provides comprehensive information about the company, its mission, vision, and core business activities. It explains what the company does, who it serves, and how it creates value in the marketplace.'

      render(
        <FormField
          {...defaultProps}
          field="business_description"
          question="Describe your business"
          value={longText}
        />
      )

      expect(screen.getByText('Good detail level')).toBeInTheDocument()
    })

    test('shows voice recording note', () => {
      render(
        <FormField
          {...defaultProps}
          field="business_description"
          question="Describe your business"
        />
      )

      expect(
        screen.getByText('Voice recording will be available in task 3.3')
      ).toBeInTheDocument()
    })

    test('applies success styling for good length text', () => {
      const longText =
        'This is a detailed business description that provides comprehensive information about the company, its mission, vision, and core business activities. It explains what the company does, who it serves, and how it creates value.'

      render(
        <FormField
          {...defaultProps}
          field="business_description"
          question="Describe your business"
          value={longText}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('border-green-500')
    })
  })
})
