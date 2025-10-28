import { ApplicationId } from '@/types'
import { FORM_STEPS } from './form-constants'

interface FormHeaderProps {
  applicationId?: ApplicationId
  currentStep: number
  progress: number
  lastSaved: Date | null
  isSaving: boolean
}

export function FormHeader({
  applicationId,
  currentStep,
  progress,
  lastSaved,
  isSaving,
}: FormHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-foreground">
        {applicationId ? 'Edit Application' : 'Create New Grant Application'}
      </h1>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep + 1} of {FORM_STEPS.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {lastSaved && (
        <p className="text-sm text-muted-foreground">
          {isSaving
            ? 'Saving...'
            : `Last saved: ${lastSaved.toLocaleTimeString()}`}
        </p>
      )}
    </div>
  )
}
