import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R
    }
  }
}
