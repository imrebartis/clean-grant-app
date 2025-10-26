import { Button } from '@/components/ui/button'

function PlaceholderMessage() {
  return (
    <div className="text-center text-sm text-muted-foreground">
      Authentication components will be implemented in Phase 1
    </div>
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

export function AuthPlaceholder() {
  return (
    <>
      <PlaceholderMessage />
      <OAuthButtons />
      <Divider />
      <Button variant="outline" className="w-full" disabled>
        Sign in with Email
      </Button>
    </>
  )
}
