import type { NextConfig } from 'next'

// Rule 3: No CSP headers here — those live in middleware.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // FIX 4: scoped to this project's images only — prevents proxying
        // assets from any other Sanity project (abuse vector + cost risk)
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/s7303wy4/**',
      },
    ],
  },
}

export default nextConfig