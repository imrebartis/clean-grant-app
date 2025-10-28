import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProfilePage from './page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock Supabase client
const mockGetUser = jest.fn()
const mockSignOut = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockUnsubscribe = jest.fn()

jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}))

// Mock ProtectedRoute to simplify testing
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockGetUser.mockClear()
    mockSignOut.mockClear()
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })
  })

  test('displays user profile information', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
      last_sign_in_at: '2024-01-02T00:00:00Z',
    }
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      // Check for date content more flexibly (different locales format differently)
      const dateElements = screen.getAllByText(/2024/)
      expect(dateElements).toHaveLength(2) // Account created and last sign in dates
    })
  })

  test('navigates back to dashboard when back button is clicked', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('← Back to Dashboard')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('← Back to Dashboard'))
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  test('signs out user when sign out button is clicked', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockSignOut.mockResolvedValue({})

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Sign Out'))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  test('shows disabled buttons for future features', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('Export Data (Coming Soon)')).toBeInTheDocument()
      expect(
        screen.getByText('Delete Account (Coming Soon)')
      ).toBeInTheDocument()
    })

    const exportButton = screen.getByText('Export Data (Coming Soon)')
    const deleteButton = screen.getByText('Delete Account (Coming Soon)')

    expect(exportButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })
})
