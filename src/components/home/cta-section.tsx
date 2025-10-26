import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <div className="space-y-4 text-center">
      <Link href="/auth">
        <Button size="lg" className="px-8">
          Get Started
        </Button>
      </Link>
    </div>
  )
}
