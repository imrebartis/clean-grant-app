import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DashboardPage from './page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock ProtectedRoute to render children directly
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock useApplications hook
jest.mock('@/hooks/use-applications', () => ({
  useApplications: () => ({
    applications: [],
    isLoading: false,
    error: null,
  }),
}))

// Mock ApplicationList component
jest.mock('@/components/applications/application-list', () => ({
  ApplicationList: ({ onCreateNew }: { onCreateNew: () => void }) => (
    <div>
      <button onClick={onCreateNew}>Create New Application</button>
    </div>
  ),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  test('founder can see dashboard title', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Grant Application Dashboard')).toBeInTheDocument()
  })

  test('founder can see create new application button', () => {
    render(<DashboardPage />)

    expect(screen.getAllByText('Create New Application')).toHaveLength(1)
  })

  test('founder is redirected to new application form when clicking create button', () => {
    render(<DashboardPage />)

    const button = screen.getAllByText('Create New Application')[0]
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledWith('/applications/new')
  })

  test('founder can navigate to profile page', () => {
    render(<DashboardPage />)

    const profileButton = screen.getByText('Profile')
    fireEvent.click(profileButton)

    expect(mockPush).toHaveBeenCalledWith('/profile')
  })
})
