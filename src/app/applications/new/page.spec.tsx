import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewApplicationPage from './page'

// Mock Next.js router
const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

// Mock ProtectedRoute to render children directly
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock ApplicationForm component
jest.mock('@/components/forms/application-form', () => ({
  ApplicationForm: () => (
    <div>
      <h1>Create New Grant Application</h1>
      <div>Application Form</div>
    </div>
  ),
}))

// Mock the custom hook
jest.mock('./use-application-form-handlers', () => ({
  useApplicationFormHandlers: () => ({
    applicationId: 'test-id',
    handleSave: jest.fn(),
    handleSubmit: jest.fn(),
  }),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

describe('NewApplicationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('founder can see application form title', () => {
    render(<NewApplicationPage />)

    expect(screen.getByText('Create New Grant Application')).toBeInTheDocument()
  })
})
