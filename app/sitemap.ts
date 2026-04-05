import type { MetadataRoute } from 'next'
import { sanityClient } from '@/lib/sanity'

export const revalidate = 86400

// FIX 6: normalise trailing slash + hard fallback so URLs in the sitemap
// are always absolute — relative URLs are invalid per sitemap protocol
// and cause Google Search Console to reject the entire file silently.
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://ngcinstitute.in'

type CourseResult = {
  classGroup: string
  subject: string
}

type BlogPostResult = {
  slug: string
  publishedDate: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static routes ────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      priority: 0.9,
      changeFrequency: 'weekly',
    },
    {
      url: `${BASE_URL}/about`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/results`,
      priority: 1.0,
      changeFrequency: 'weekly',
    },
    {
      url: `${BASE_URL}/contact`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/courses`,
      priority: 0.9,
      changeFrequency: 'weekly',
    },
  ]

  // ── Dynamic: courses ─────────────────────────────────────────────────────
  let courseRoutes: MetadataRoute.Sitemap = []
  try {
    const courses = await sanityClient.fetch<CourseResult[]>(
      `*[_type == "course"]{
        classGroup,
        "subject": subjectSlug.current
      }`
    )
    courseRoutes = courses
      .filter((c) => c.classGroup && c.subject)
      .map((c) => ({
        // FIX 8: encode both segments — Sanity values like "Class 9" or
        // "Grade 10+" contain spaces/special chars that break sitemap URLs
        url: `${BASE_URL}/courses/${encodeURIComponent(c.classGroup)}/${encodeURIComponent(c.subject)}`,
        priority: 1.0,
        changeFrequency: 'weekly' as const,
      }))
  } catch (err) {
    // FIX 7: log so GROQ errors / misconfigurations leave a trace in
    // production logs rather than silently producing an empty section
    console.error('[sitemap] Failed to fetch courses:', err)
    courseRoutes = []
  }

  // ── Dynamic: blog posts ──────────────────────────────────────────────────
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const posts = await sanityClient.fetch<BlogPostResult[]>(
      `*[_type == "blogPost"]{
        "slug": slug.current,
        publishedDate
      }`
    )
    blogRoutes = posts
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${BASE_URL}/blog/${p.slug}`,
        priority: 0.8,
        changeFrequency: 'monthly' as const,
        ...(p.publishedDate && { lastModified: new Date(p.publishedDate) }),
      }))
  } catch (err) {
    // FIX 7: same — log rather than silently swallow
    console.error('[sitemap] Failed to fetch blog posts:', err)
    blogRoutes = []
  }

  return [...staticRoutes, ...courseRoutes, ...blogRoutes]
}