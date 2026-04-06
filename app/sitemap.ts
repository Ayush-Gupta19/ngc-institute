import type { MetadataRoute } from 'next'
import { sanityClient } from '@/lib/sanity'

export const revalidate = 86400

// Normalise trailing slash + hard fallback so URLs in the sitemap are always
// absolute — relative URLs are invalid per sitemap protocol and cause Google
// Search Console to reject the entire file silently.
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
    // Note: /courses is included only once app/courses/page.tsx is built.
    // Submitting a URL that returns 404 creates a Search Console coverage error.
  ]

  // ── Dynamic: courses ─────────────────────────────────────────────────────
  let courseRoutes: MetadataRoute.Sitemap = []
  try {
    // Issue 8 fixed: perspective:'published' prevents draft courses appearing
    // Issue 9 fixed: cache:'force-cache' + tags prevents hammering Sanity on
    //                every sitemap request
    const courses = await sanityClient.fetch<CourseResult[]>(
      `*[_type == "course"]{
        classGroup,
        "subject": subjectSlug.current
      }`,
      {},
      {
        cache: 'force-cache',
        next: { tags: ['courses'] },
        perspective: 'published',
      },
    )
    courseRoutes = courses
      .filter((c) => c.classGroup && c.subject)
      .map((c) => ({
        // Issue 7 fixed: both segments encoded — values like "Class 9" or
        // slugs with unexpected characters produce valid sitemap URLs
        url: `${BASE_URL}/courses/${encodeURIComponent(c.classGroup)}/${encodeURIComponent(c.subject)}`,
        priority: 1.0,
        changeFrequency: 'weekly' as const,
      }))
  } catch (err) {
    // Log so GROQ errors leave a trace in production logs rather than
    // silently producing an empty section
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
      }`,
      {},
      {
        cache: 'force-cache',
        next: { tags: ['blog'] },
        perspective: 'published',
      },
    )
    blogRoutes = posts
      .filter((p) => p.slug)
      .map((p) => ({
        // Issue 7 fixed: slug encoded — unexpected characters break sitemap URLs
        url: `${BASE_URL}/blog/${encodeURIComponent(p.slug)}`,
        priority: 0.8,
        changeFrequency: 'monthly' as const,
        ...(p.publishedDate && { lastModified: new Date(p.publishedDate) }),
      }))
  } catch (err) {
    console.error('[sitemap] Failed to fetch blog posts:', err)
    blogRoutes = []
  }

  return [...staticRoutes, ...courseRoutes, ...blogRoutes]
}