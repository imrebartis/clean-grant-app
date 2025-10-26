import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function VoiceQuestionsList() {
  return (
    <ul className="space-y-1 text-sm text-muted-foreground">
      <li>• Business description and target market</li>
      <li>• Environmental problem you&apos;re solving</li>
      <li>• Business model and revenue</li>
      <li>• Key achievements (last 12 months)</li>
      <li>• Specific funding use plans</li>
      <li>• Goals for the next 2 years</li>
      <li>• Competitors and alternatives</li>
      <li>• Your unique positioning</li>
      <li>• Financial statements PDF upload</li>
    </ul>
  )
}

function VoiceRecordingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Recording & Documents</CardTitle>
        <CardDescription>
          Answer 8 key questions by voice + upload financial PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VoiceQuestionsList />
      </CardContent>
    </Card>
  )
}

function DocumentGenerationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Generation</CardTitle>
        <CardDescription>
          AI-powered grant document creation via Make.com
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Automatic transcription and analysis</li>
          <li>• Professional 10-page grant document</li>
          <li>• Google Docs delivery</li>
          <li>• Email notification when ready</li>
        </ul>
      </CardContent>
    </Card>
  )
}

export function FeatureCards() {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2">
      <VoiceRecordingCard />
      <DocumentGenerationCard />
    </div>
  )
}
