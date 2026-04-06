import type { NextConfig } from 'next'

// Rule 3: No CSP headers here — those live in proxy.ts
const nextConfig: NextConfig = {
  // Issue 5 fixed: hides X-Powered-By: Next.js header from responses
  // preventing framework fingerprinting by attackers scanning for CVEs
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        // Scoped to this project's images only — prevents proxying assets
        // from any other Sanity project (abuse vector + bandwidth cost risk)
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/s7303wy4/**',
      },
    ],
  },
}

export default nextConfig