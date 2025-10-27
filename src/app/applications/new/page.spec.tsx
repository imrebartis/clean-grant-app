import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewApplicationPage from './page'

describe('NewApplicationPage', () => {
  test('founder can see application form title', () => {
    render(<NewApplicationPage />)

    expect(screen.getByText('Create New Grant Application')).toBeInTheDocument()
  })
})
