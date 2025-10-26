declare module 'jest-axe' {
  export function axe(element: Element | Document): Promise<unknown>
  export function toHaveNoViolations(received: unknown): {
    pass: boolean
    message(): string
  }
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R
    }
  }
}
