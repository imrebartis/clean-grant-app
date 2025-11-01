/**
 * Form Navigation Buttons with Email Validation Control
 * Handles Next button state based on email validation
 */

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { validateEmail } from '@/lib/email-validation'
import { type GrantApplicationFormDataType } from '@/lib/validation'
import { FORM_STEPS } from './form-constants'

interface FormNavigationButtonsProps {
  currentStep: number
  formData: GrantApplicationFormDataType
  isLoading: boolean
  isSaving: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

// Tooltip component for disabled button explanation
function DisabledButtonTooltip({
  children,
  message,
  show,
}: {
  children: React.ReactNode
  message: string
  show: boolean
}) {
  if (!show) return <>{children}</>

  return (
    <div className="group relative">
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        {message}
        <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )
}

// Progress indicator component
function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
      <span>
        Step {currentStep + 1} of {FORM_STEPS.length}
      </span>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / FORM_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

// Check if current step is the basic info step (contains email field)
function isBasicInfoStep(currentStep: number): boolean {
  const currentStepConfig = FORM_STEPS[currentStep]
  return currentStepConfig?.id === 'basic-info' || false
}

// Validate email field for navigation control
function validateEmailForNavigation(email: string | undefined): {
  isValid: boolean
  message?: string
} {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      message: 'Email address is required to continue',
    }
  }

  const validation = validateEmail(email)
  if (!validation.isValid) {
    return {
      isValid: false,
      message: 'Please enter a valid email address to continue',
    }
  }

  return { isValid: true }
}

// Check if user can proceed to next step
function canProceedToNext(
  currentStep: number,
  formData: GrantApplicationFormDataType
): {
  canProceed: boolean
  reason?: string
} {
  // For the basic info step, validate all required fields
  if (isBasicInfoStep(currentStep)) {
    if (!formData.company_name?.trim()) {
      return {
        canProceed: false,
        reason: 'Company name is required',
      }
    }

    if (!formData.founder_name?.trim()) {
      return {
        canProceed: false,
        reason: 'Founder name is required',
      }
    }

    const emailValidation = validateEmailForNavigation(formData.founder_email)
    if (!emailValidation.isValid) {
      return {
        canProceed: false,
        reason: emailValidation.message,
      }
    }

    if (!formData.website_url?.trim()) {
      return {
        canProceed: false,
        reason: 'Website URL is required',
      }
    }

    try {
      // This will throw if the URL is invalid
      new URL(formData.website_url)
    } catch {
      return {
        canProceed: false,
        reason: 'Please enter a valid URL (e.g., https://example.com)',
      }
    }
  }

  // For all other steps, allow proceeding
  return { canProceed: true }
}

// Button content component
function getButtonContent({
  isLoading,
  isSaving,
  isLastStep,
}: {
  isLoading: boolean
  isSaving: boolean
  isLastStep: boolean
}) {
  if (isLoading) return 'Submitting...'
  if (isSaving) return 'Saving...'
  return isLastStep ? 'Submit Application' : 'Next'
}

// Button component
function NavigationButton({
  isLastStep,
  isDisabled,
  disabledReason,
  onNext,
  onSubmit,
  children,
}: {
  isLastStep: boolean
  isDisabled: boolean
  disabledReason?: string
  onNext: () => void
  onSubmit: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      onClick={isLastStep ? onSubmit : onNext}
      disabled={isDisabled}
      className={cn(
        'min-w-[140px] transition-all duration-200',
        isDisabled && 'cursor-not-allowed'
      )}
      aria-describedby={
        isDisabled && disabledReason ? 'next-button-help' : undefined
      }
    >
      {children}
    </Button>
  )
}

// Screen reader help text component
function ScreenReaderHelpText({
  isDisabled,
  disabledReason,
}: {
  isDisabled: boolean
  disabledReason?: string
}) {
  if (!isDisabled || !disabledReason) return null

  return (
    <div id="next-button-help" className="sr-only">
      {disabledReason}
    </div>
  )
}

// Action button component (Next or Submit)
function ActionButton({
  currentStep,
  canProceed,
  disabledReason,
  isLoading,
  isSaving,
  onNext,
  onSubmit,
}: {
  currentStep: number
  canProceed: boolean
  disabledReason?: string
  isLoading: boolean
  isSaving: boolean
  onNext: () => void
  onSubmit: () => void
}) {
  const isLastStep = currentStep === FORM_STEPS.length - 1
  const isDisabled = !canProceed || isLoading || isSaving
  const buttonContent = getButtonContent({ isLoading, isSaving, isLastStep })

  return (
    <>
      <DisabledButtonTooltip
        message={disabledReason || 'Please complete required fields'}
        show={isDisabled && !!disabledReason}
      >
        <NavigationButton
          isLastStep={isLastStep}
          isDisabled={isDisabled}
          disabledReason={disabledReason}
          onNext={onNext}
          onSubmit={onSubmit}
        >
          {buttonContent}
        </NavigationButton>
      </DisabledButtonTooltip>

      <ScreenReaderHelpText
        isDisabled={isDisabled}
        disabledReason={disabledReason}
      />
    </>
  )
}

export function FormNavigationButtons({
  currentStep,
  formData,
  isLoading,
  isSaving,
  onPrevious,
  onNext,
  onSubmit,
}: FormNavigationButtonsProps) {
  const isFirstStep = currentStep === 0
  const { canProceed, reason } = canProceedToNext(currentStep, formData)

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isLoading || isSaving}
        className="min-w-[100px]"
      >
        Previous
      </Button>

      <div className="flex items-center gap-4">
        <ProgressIndicator currentStep={currentStep} />
        <ActionButton
          currentStep={currentStep}
          canProceed={canProceed}
          disabledReason={reason}
          isLoading={isLoading}
          isSaving={isSaving}
          onNext={onNext}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  )
}
