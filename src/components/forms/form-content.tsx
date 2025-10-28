import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type GrantApplicationFormDataType } from '@/lib/validation'
import { FORM_STEPS, VOICE_QUESTIONS } from './form-constants'
import { FormField } from './form-field'

interface FormContentProps {
  currentStepConfig: (typeof FORM_STEPS)[number]
  formData: GrantApplicationFormDataType
  errors: Record<string, string>
  onFieldChange: (field: string, value: string) => void
}

export function FormContent({
  currentStepConfig,
  formData,
  errors,
  onFieldChange,
}: FormContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentStepConfig.title}</CardTitle>
        <p className="text-muted-foreground">{currentStepConfig.description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentStepConfig.fields.map((field: string) => (
          <FormField
            key={field}
            field={field}
            value={String(
              formData[field as keyof GrantApplicationFormDataType] || ''
            )}
            onChange={value => onFieldChange(field, value)}
            error={errors[field]}
            question={VOICE_QUESTIONS[field as keyof typeof VOICE_QUESTIONS]}
          />
        ))}

        {errors.general && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {errors.general}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
