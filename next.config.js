/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  eslint: {
    // Only run ESLint on src directory during build
    dirs: ['src'],
  },
}

module.exports = nextConfig
