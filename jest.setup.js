require('@testing-library/jest-dom')
require('jest-axe/extend-expect')

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }) => children,
}))

// Only mock Supabase when explicitly requested for unit tests
if (process.env.SUPABASE_TEST_MODE === 'mock') {
  jest.mock('@supabase/auth-helpers-nextjs', () => ({
    createClientComponentClient: () => ({
      auth: {
        signUp: jest
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        signInWithPassword: jest
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        signInWithOAuth: jest
          .fn()
          .mockResolvedValue({ data: { url: 'mock-url' }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ data: null, error: null }),
          download: jest.fn().mockResolvedValue({ data: null, error: null }),
          remove: jest.fn().mockResolvedValue({ data: null, error: null }),
          getPublicUrl: jest
            .fn()
            .mockReturnValue({ data: { publicUrl: 'mock-url' } }),
        })),
      },
    }),
    createServerComponentClient: () => ({
      auth: {
        signUp: jest
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        signInWithPassword: jest
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        signInWithOAuth: jest
          .fn()
          .mockResolvedValue({ data: { url: 'mock-url' }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ data: null, error: null }),
          download: jest.fn().mockResolvedValue({ data: null, error: null }),
          remove: jest.fn().mockResolvedValue({ data: null, error: null }),
          getPublicUrl: jest
            .fn()
            .mockReturnValue({ data: { publicUrl: 'mock-url' } }),
        })),
      },
    }),
  }))
}
