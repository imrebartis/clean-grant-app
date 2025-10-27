import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthPage from './page'

// Mock Supabase
const mockSignInWithOAuth = jest.fn()
jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}))

// Mock Next.js useSearchParams
const mockSearchParams = {
  get: jest.fn(() => null),
}
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

describe('AuthPage', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockClear()
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
})
