import { Button } from '@/components/ui/button'
import { FORM_STEPS } from './form-constants'

interface FormNavigationProps {
  currentStep: number
  isLoading: boolean
  isSaving: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
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

// Action button component
function ActionButton({
  isLastStep,
  isLoading,
  isSaving,
  onNext,
  onSubmit,
}: {
  isLastStep: boolean
  isLoading: boolean
  isSaving: boolean
  onNext: () => void
  onSubmit: () => void
}) {
  if (isLastStep) {
    return (
      <Button
        onClick={onSubmit}
        disabled={isLoading || isSaving}
        className="min-w-[140px]"
      >
        {isLoading
          ? 'Submitting...'
          : isSaving
            ? 'Saving...'
            : 'Submit Application'}
      </Button>
    )
  }

  return (
    <Button
      onClick={onNext}
      disabled={isLoading || isSaving}
      className="min-w-[100px]"
    >
      {isSaving ? 'Saving...' : 'Next'}
    </Button>
  )
}

export function FormNavigation({
  currentStep,
  isLoading,
  isSaving,
  onPrevious,
  onNext,
  onSubmit,
}: FormNavigationProps) {
  const isLastStep = currentStep === FORM_STEPS.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isLoading || isSaving}
      >
        Previous
      </Button>

      <div className="flex items-center gap-4">
        <ProgressIndicator currentStep={currentStep} />
        <ActionButton
          isLastStep={isLastStep}
          isLoading={isLoading}
          isSaving={isSaving}
          onNext={onNext}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  )
}
