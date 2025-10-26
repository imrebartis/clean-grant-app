import { ThemeToggle } from '@/components/theme-toggle'
import { HeroSection } from '@/components/home/hero-section'
import { FeatureCards } from '@/components/home/feature-cards'
import { CTASection } from '@/components/home/cta-section'

function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">
            Grant Application Assistant
          </h1>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function MainContent() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <HeroSection />
      <FeatureCards />
      <CTASection />
    </main>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainContent />
    </div>
  )
}
