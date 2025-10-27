import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Grant Application Assistant
        </h1>
        <p className="text-xl text-muted-foreground">
          Create and manage your grant applications
        </p>
        <Link
          href="/auth"
          className="inline-block rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
