import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProtectedRoute } from './protected-route'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock Supabase client
const mockGetUser = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockUnsubscribe = jest.fn()

jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockGetUser.mockClear()
    mockOnAuthStateChange.mockClear()
    mockUnsubscribe.mockClear()
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })
  })

  test('shows loading state initially', () => {
    mockGetUser.mockReturnValue(
      new Promise(() => {}) // Never resolves to keep loading state
    )

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('shows custom fallback when provided', () => {
    mockGetUser.mockReturnValue(
      new Promise(() => {}) // Never resolves to keep loading state
    )

    render(
      <ProtectedRoute fallback={<div>Custom loading</div>}>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Custom loading')).toBeInTheDocument()
  })

  test('redirects to auth when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth')
    })

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  test('shows protected content when user is authenticated', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected content')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  test('redirects to auth when user signs out', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })

    // Mock the auth state change callback
    let authStateCallback:
      | ((event: string, session: unknown) => void)
      | undefined
    mockOnAuthStateChange.mockImplementation(callback => {
      authStateCallback = callback
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
    })

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected content')).toBeInTheDocument()
    })

    // Simulate sign out
    expect(authStateCallback).toBeDefined()
    authStateCallback!('SIGNED_OUT', null)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth')
    })
  })
})
