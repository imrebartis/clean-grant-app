import { Button } from '@/components/ui/button'
import { FORM_STEPS } from './form-constants'

interface FormNavigationProps {
  currentStep: number
  isLoading: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

export function FormNavigation({
  currentStep,
  isLoading,
  onPrevious,
  onNext,
  onSubmit,
}: FormNavigationProps) {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
      >
        Previous
      </Button>

      <div className="flex gap-2">
        {currentStep === FORM_STEPS.length - 1 ? (
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </Button>
        ) : (
          <Button onClick={onNext}>Next</Button>
        )}
      </div>
    </div>
  )
}
