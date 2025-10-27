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

// Mock Next.js useSearchParams
const mockSearchParams = {
  get: jest.fn<string | null, [string]>(() => null),
}
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

describe('AuthPage', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockClear()
    mockSignOut.mockClear()
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

  test('shows helpful error message and signs out user when access is denied', async () => {
    mockSearchParams.get.mockReturnValue('access_denied')
    mockSignOut.mockResolvedValue({})

    render(<AuthPage />)

    // Should show signing out message initially
    expect(screen.getByText('Signing you out...')).toBeInTheDocument()

    // Wait for sign out to complete and error message to appear
    await screen.findByText(/Access denied/)

    expect(mockSignOut).toHaveBeenCalled()
    expect(screen.getByText('What can you do?')).toBeInTheDocument()
    expect(
      screen.getByText(/Contact the administrator to request access/)
    ).toBeInTheDocument()
  })
})
