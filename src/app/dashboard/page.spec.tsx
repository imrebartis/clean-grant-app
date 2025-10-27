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

describe('DashboardPage', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  test('founder can see dashboard welcome message', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Welcome to your dashboard')).toBeInTheDocument()
  })

  test('founder can see create new application button', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Create New Application')).toBeInTheDocument()
  })

  test('founder is redirected to new application form when clicking create button', () => {
    render(<DashboardPage />)

    const button = screen.getByText('Create New Application')
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledWith('/applications/new')
  })
})
