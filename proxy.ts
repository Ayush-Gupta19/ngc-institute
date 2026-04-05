import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // Rule 1: Web Crypto API only — no 'crypto' import
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  const nonce = btoa(String.fromCharCode(...array))

  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com`,
    // FIX 3: removed 'unsafe-inline' — it negates the nonce entirely
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data: https://cdn.sanity.io https://img.youtube.com`,
    `font-src 'self'`,
    `frame-src https://www.youtube-nocookie.com https://www.youtube.com https://maps.google.com`,
    `connect-src 'self' https://cdn.sanity.io https://api.sanity.io https://www.google-analytics.com https://www.googletagmanager.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')

  // FIX 1: forward nonce on the *request* headers so layout.tsx can read
  // it server-side via next/headers, AND set it on the response so the
  // browser receives the CSP policy.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

// FIX 2: idiomatic matcher — excludes static assets and prefetch requests
export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}