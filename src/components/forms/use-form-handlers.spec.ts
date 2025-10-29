import { renderHook, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useFormHandlers } from './use-form-handlers'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock form constants
jest.mock('./form-constants', () => ({
  FORM_STEPS: [
    { id: 'step1', fields: ['company_name', 'founder_name'] },
    { id: 'step2', fields: ['founder_email'] },
    { id: 'step3', fields: ['business_description'] },
  ],
}))

describe('useFormHandlers', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }

  const defaultProps = {
    formData: {},
    setFormData: jest.fn(),
    errors: {},
    setErrors: jest.fn(),
    currentStep: 0,
    setCurrentStep: jest.fn(),
    setIsLoading: jest.fn(),
    isSaving: false,
    setIsSaving: jest.fn(),
    setLastSaved: jest.fn(),
    router: mockRouter,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  test('handleFieldChange updates form data and clears errors', () => {
    const mockSetFormData = jest.fn()
    const mockSetErrors = jest.fn()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        setFormData: mockSetFormData,
        setErrors: mockSetErrors,
        errors: { company_name: 'Required field' },
      })
    )

    act(() => {
      result.current.handleFieldChange('company_name', 'Test Company')
    })

    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function))
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function))
  })

  test('validateCurrentStep returns true for valid step', () => {
    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        formData: { company_name: 'Test Company', founder_name: 'John Doe' },
      })
    )

    let isValid: boolean
    act(() => {
      isValid = result.current.validateCurrentStep()
    })

    expect(isValid!).toBe(true)
  })

  test('validateCurrentStep returns false for invalid step', () => {
    const mockSetErrors = jest.fn()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        setErrors: mockSetErrors,
        formData: { company_name: '' }, // Missing required field
      })
    )

    let isValid: boolean
    act(() => {
      isValid = result.current.validateCurrentStep()
    })

    expect(isValid!).toBe(false)
    expect(mockSetErrors).toHaveBeenCalled()
  })

  test('validateCurrentStep validates email format', () => {
    const mockSetErrors = jest.fn()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        currentStep: 1, // Email step
        setErrors: mockSetErrors,
        formData: { founder_email: 'invalid-email' },
      })
    )

    let isValid: boolean
    act(() => {
      isValid = result.current.validateCurrentStep()
    })

    expect(isValid!).toBe(false)
    expect(mockSetErrors).toHaveBeenCalledWith(
      expect.objectContaining({
        founder_email: 'Please enter a valid email address',
      })
    )
  })

  test('handleNext advances step when validation passes', async () => {
    const mockSetCurrentStep = jest.fn()
    const mockOnSave = jest.fn().mockResolvedValue(undefined)
    const mockSetIsSaving = jest.fn()
    const mockSetLastSaved = jest.fn()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        setCurrentStep: mockSetCurrentStep,
        onSave: mockOnSave,
        setIsSaving: mockSetIsSaving,
        setLastSaved: mockSetLastSaved,
        formData: { company_name: 'Test Company', founder_name: 'John Doe' },
      })
    )

    await act(async () => {
      await result.current.handleNext()
    })

    expect(mockOnSave).toHaveBeenCalled()
    expect(mockSetIsSaving).toHaveBeenCalledWith(true)
    expect(mockSetIsSaving).toHaveBeenCalledWith(false)
    expect(mockSetLastSaved).toHaveBeenCalled()
    expect(mockSetCurrentStep).toHaveBeenCalledWith(expect.any(Function))
  })

  test('handleNext does not advance step when validation fails', async () => {
    const mockSetCurrentStep = jest.fn()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        setCurrentStep: mockSetCurrentStep,
        formData: { company_name: '' }, // Invalid data
      })
    )

    await act(async () => {
      await result.current.handleNext()
    })

    expect(mockSetCurrentStep).not.toHaveBeenCalled()
  })

  test('handleNext handles save errors gracefully', async () => {
    const mockOnSave = jest.fn().mockRejectedValue(new Error('Save failed'))
    const mockSetIsSaving = jest.fn()
    const mockSetCurrentStep = jest.fn()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        onSave: mockOnSave,
        setIsSaving: mockSetIsSaving,
        setCurrentStep: mockSetCurrentStep,
        formData: { company_name: 'Test Company', founder_name: 'John Doe' },
      })
    )

    await act(async () => {
      await result.current.handleNext()
    })

    expect(consoleSpy).toHaveBeenCalledWith('Save failed:', expect.any(Error))
    expect(mockSetCurrentStep).toHaveBeenCalled() // Should still advance despite save error

    consoleSpy.mockRestore()
  })

  test('handlePrevious goes to previous step', () => {
    const mockSetCurrentStep = jest.fn()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        currentStep: 1,
        setCurrentStep: mockSetCurrentStep,
      })
    )

    act(() => {
      result.current.handlePrevious()
    })

    expect(mockSetCurrentStep).toHaveBeenCalledWith(expect.any(Function))
  })

  test('handlePrevious does not go below step 0', () => {
    const mockSetCurrentStep = jest.fn()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        currentStep: 0,
        setCurrentStep: mockSetCurrentStep,
      })
    )

    act(() => {
      result.current.handlePrevious()
    })

    expect(mockSetCurrentStep).toHaveBeenCalledWith(expect.any(Function))
  })

  test('handleSubmit validates and submits form', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
    const mockSetIsLoading = jest.fn()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        onSubmit: mockOnSubmit,
        setIsLoading: mockSetIsLoading,
        formData: {
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
        },
      })
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockSetIsLoading).toHaveBeenCalledWith(true)
    expect(mockOnSubmit).toHaveBeenCalled()
    expect(mockSetIsLoading).toHaveBeenCalledWith(false)
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
  })

  test('handleSubmit handles validation errors', async () => {
    const mockOnSubmit = jest.fn()
    const mockSetErrors = jest.fn()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        onSubmit: mockOnSubmit,
        setErrors: mockSetErrors,
        formData: {}, // Invalid data
      })
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
    expect(mockSetErrors).toHaveBeenCalledWith(
      expect.objectContaining({
        general: expect.any(String),
      })
    )
  })

  test('handleSubmit handles submission errors', async () => {
    const mockOnSubmit = jest
      .fn()
      .mockRejectedValue(new Error('Submission failed'))
    const mockSetErrors = jest.fn()
    const mockSetIsLoading = jest.fn()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const { result } = renderHook(() =>
      useFormHandlers({
        ...defaultProps,
        onSubmit: mockOnSubmit,
        setErrors: mockSetErrors,
        setIsLoading: mockSetIsLoading,
        formData: {
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
        },
      })
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Form submission failed:',
      expect.any(Error)
    )
    expect(mockSetErrors).toHaveBeenCalledWith(
      expect.objectContaining({
        general: 'Submission failed',
      })
    )
    expect(mockSetIsLoading).toHaveBeenCalledWith(false)

    consoleSpy.mockRestore()
  })
})
