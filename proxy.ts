import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  const nonce = btoa(String.fromCharCode(...array))

  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data: https://cdn.sanity.io https://img.youtube.com https://lh3.googleusercontent.com`,
    `font-src 'self'`,
    `frame-src https://www.youtube-nocookie.com https://www.youtube.com https://maps.google.com`,
    `connect-src 'self' https://cdn.sanity.io https://api.sanity.io https://*.api.sanity.io https://www.google-analytics.com https://www.googletagmanager.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')

  // Nonce goes on the REQUEST headers only — layout.tsx reads it server-side.
  // It must NOT be set on the RESPONSE headers because any JS running on the
  // page could read it via fetch() and use it to execute injected scripts,
  // defeating the entire purpose of the nonce-based CSP.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.headers.set('Content-Security-Policy', cspHeader)
  // Issue 1 fixed: x-nonce removed from response headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Issue 2 fixed: HSTS added — forces HTTPS on all future visits
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  // Issue 3 fixed: Permissions-Policy restricts browser feature access
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')

  return response
}

export const config = {
  matcher: [
    {
      // Issue fixed: studio excluded — Sanity Studio loads hundreds of JS
      // chunks dynamically which conflicts with strict nonce CSP.
      // Studio is staff-only and has its own Sanity auth layer.
      source: '/((?!_next/static|_next/image|favicon.ico|studio).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}