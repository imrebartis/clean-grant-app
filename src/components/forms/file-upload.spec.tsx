import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FileUpload } from './file-upload'

// Mock setTimeout for file upload simulation
jest.useFakeTimers()

describe('FileUpload', () => {
  const defaultProps = {
    id: 'test-upload',
    label: 'Upload File',
    value: '',
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders file upload component with label', () => {
    render(<FileUpload {...defaultProps} />)

    expect(screen.getByText('Upload File')).toBeInTheDocument()
    expect(screen.getByText('Choose File')).toBeInTheDocument()
    expect(screen.getByText('Or enter a URL to your PDF:')).toBeInTheDocument()
  })

  test('shows default description', () => {
    render(<FileUpload {...defaultProps} />)

    expect(
      screen.getByText(
        'Upload your financial statements as a PDF file (max 10MB)'
      )
    ).toBeInTheDocument()
  })

  test('shows custom description when provided', () => {
    render(
      <FileUpload {...defaultProps} description="Custom upload description" />
    )

    expect(screen.getByText('Custom upload description')).toBeInTheDocument()
  })

  test('calls onChange when URL is entered', async () => {
    const mockOnChange = jest.fn()

    render(<FileUpload {...defaultProps} onChange={mockOnChange} />)

    const urlInput = screen.getByPlaceholderText(
      'https://example.com/financial-statements.pdf'
    )
    fireEvent.change(urlInput, {
      target: { value: 'https://example.com/test.pdf' },
    })

    expect(mockOnChange).toHaveBeenCalledWith('https://example.com/test.pdf')
  })

  test('shows file name when value is provided', () => {
    render(
      <FileUpload
        {...defaultProps}
        value="https://example.com/financial-statements.pdf"
      />
    )

    expect(screen.getByText('financial-statements.pdf')).toBeInTheDocument()
    expect(screen.getByText('×')).toBeInTheDocument() // Remove button
  })

  test('removes file when remove button is clicked', async () => {
    const mockOnChange = jest.fn()

    render(
      <FileUpload
        {...defaultProps}
        value="https://example.com/test.pdf"
        onChange={mockOnChange}
      />
    )

    const removeButton = screen.getByText('×')
    fireEvent.click(removeButton)

    expect(mockOnChange).toHaveBeenCalledWith('')
  })

  test('shows success message when file is ready', () => {
    render(
      <FileUpload {...defaultProps} value="https://example.com/test.pdf" />
    )

    expect(screen.getByText('File ready for submission')).toBeInTheDocument()
  })

  test('shows error message when provided', () => {
    render(<FileUpload {...defaultProps} error="File upload failed" />)

    expect(screen.getByText('File upload failed')).toBeInTheDocument()
  })

  test('applies error styling to URL input when error exists', () => {
    render(<FileUpload {...defaultProps} error="Invalid file" />)

    const urlInput = screen.getByPlaceholderText(
      'https://example.com/financial-statements.pdf'
    )
    expect(urlInput).toHaveClass('border-destructive')
  })

  describe('file selection', () => {
    test('shows upload error for non-PDF file', async () => {
      const mockOnChange = jest.fn()

      render(<FileUpload {...defaultProps} onChange={mockOnChange} />)

      const fileInput = document.querySelector(
        '#test-upload-file'
      ) as HTMLInputElement
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Please select a PDF file')).toBeInTheDocument()
      })
    })

    test('shows upload error for oversized file', async () => {
      const mockOnChange = jest.fn()

      render(
        <FileUpload {...defaultProps} maxSize={1} onChange={mockOnChange} />
      )

      const fileInput = document.querySelector(
        '#test-upload-file'
      ) as HTMLInputElement
      // Create a file larger than 1MB
      const largeContent = 'x'.repeat(2 * 1024 * 1024) // 2MB
      const file = new File([largeContent], 'test.pdf', {
        type: 'application/pdf',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(
          screen.getByText('File size must be less than 1MB')
        ).toBeInTheDocument()
      })
    })

    test('shows uploading state during file upload', async () => {
      const mockOnChange = jest.fn()

      render(<FileUpload {...defaultProps} onChange={mockOnChange} />)

      const fileInput = document.querySelector(
        '#test-upload-file'
      ) as HTMLInputElement
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      expect(screen.getByText('Uploading...')).toBeInTheDocument()

      // Fast-forward timers to complete upload
      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.stringContaining('test.pdf')
        )
      })
    })

    test('disables upload button during upload', async () => {
      render(<FileUpload {...defaultProps} />)

      const fileInput = document.querySelector(
        '#test-upload-file'
      ) as HTMLInputElement
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      const uploadButton = screen.getByText('Uploading...')
      expect(uploadButton).toBeDisabled()
    })
  })

  test('accepts custom file types', () => {
    render(<FileUpload {...defaultProps} accept=".jpg,.png" />)

    const fileInput = document.querySelector(
      '#test-upload-file'
    ) as HTMLInputElement
    expect(fileInput).toHaveAttribute('accept', '.jpg,.png')
  })

  test('handles file name extraction edge cases', () => {
    render(<FileUpload {...defaultProps} value="invalid-url" />)

    expect(screen.getByText('invalid-url')).toBeInTheDocument()
  })
})
