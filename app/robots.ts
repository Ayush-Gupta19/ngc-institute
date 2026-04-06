import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Normalise trailing slash + hard fallback if env var is missing at
  // build time — prevents `undefined/sitemap.xml` reaching crawlers
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'https://ngcinstitute.in'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}