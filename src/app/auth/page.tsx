import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function AuthHeader() {
  return (
    <CardHeader className="text-center">
      <CardTitle>Welcome</CardTitle>
      <CardDescription>
        Sign in to create your grant application
      </CardDescription>
    </CardHeader>
  )
}

function OAuthButtons() {
  return (
    <div className="space-y-2">
      <Button className="w-full" disabled>
        Sign in with Google
      </Button>
      <Button variant="outline" className="w-full" disabled>
        Sign in with GitHub
      </Button>
    </div>
  )
}

function Divider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <AuthHeader />
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Authentication components will be implemented in Phase 1
          </div>
          <OAuthButtons />
          <Divider />
          <Button variant="outline" className="w-full" disabled>
            Sign in with Email
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
