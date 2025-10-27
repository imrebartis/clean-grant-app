import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OAuthButtons } from './oauth-buttons'

// Mock Supabase client
const mockSignInWithOAuth = jest.fn()
jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}))

describe('OAuthButtons', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockClear()
  })

  test('renders Google sign in button', () => {
    render(<OAuthButtons />)

    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
    expect(screen.getByLabelText('Sign in with Google')).toBeInTheDocument()
  })

  test('calls Google OAuth when button is clicked', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null })

    render(<OAuthButtons />)

    const button = screen.getByText('Sign in with Google')
    fireEvent.click(button)

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  })

  test('calls onError when OAuth fails', async () => {
    const mockOnError = jest.fn()
    const mockError = { message: 'OAuth failed' }
    mockSignInWithOAuth.mockResolvedValue({ error: mockError })

    render(<OAuthButtons onError={mockOnError} />)

    const button = screen.getByText('Sign in with Google')
    fireEvent.click(button)

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockOnError).toHaveBeenCalledWith('OAuth failed')
  })

  test('calls onError when OAuth throws exception', async () => {
    const mockOnError = jest.fn()
    mockSignInWithOAuth.mockRejectedValue(new Error('Network error'))

    render(<OAuthButtons onError={mockOnError} />)

    const button = screen.getByText('Sign in with Google')
    fireEvent.click(button)

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockOnError).toHaveBeenCalledWith(
      'Failed to sign in with Google. Please try again.'
    )
  })
})
