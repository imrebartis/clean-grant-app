import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthPage from './page'

// Mock Supabase
const mockSignInWithOAuth = jest.fn()
const mockSignOut = jest.fn()
jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
    },
  }),
}))

// Mock Next.js navigation hooks
const mockSearchParams = {
  get: jest.fn<string | null, [string]>(() => null),
}
const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
}
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => mockRouter,
}))

describe('AuthPage', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockClear()
    mockSignOut.mockClear()
    mockPush.mockClear()
    mockSearchParams.get.mockReturnValue(null)
  })

  test('founder can see Google sign in button', () => {
    render(<AuthPage />)

    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
  })

  test('founder triggers Google OAuth when clicking sign in', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null })

    render(<AuthPage />)

    const button = screen.getByText('Sign in with Google')
    fireEvent.click(button)

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  })

  test('signs out user and redirects to landing page when access is denied', async () => {
    mockSearchParams.get.mockReturnValue('access_denied')
    mockSignOut.mockResolvedValue({})

    render(<AuthPage />)

    // Should show signing out message initially
    expect(screen.getByText('Signing you out...')).toBeInTheDocument()

    // Wait for sign out to complete and redirect
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockSignOut).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
