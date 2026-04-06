// /**
//  * lib/queries.ts
//  *
//  * All GROQ queries and Zod validation schemas for the NGC Institute site.
//  *
//  * Rules enforced throughout:
//  *  Rule 13 — cache: 'force-cache' + next: { tags: [...] } on every fetch
//  *  Rule 14 — every query wrapped in try-catch; return null / [] on failure
//  *  Rule 15 — all Zod array items include _key
//  *  Rule 16 — getAllCourses uses MINIMAL Zod schema
//  *  Rule 17 — generateStaticParams callers return [] on failure (handled here)
//  *  Rule 18 — image queries fetch asset->{_id,url}, hotspot, crop, alt
//  *  Rule 19 — perspective: 'published' on all fetches
//  */

// import { z } from 'zod'
// import { sanityClient } from './sanity'

// // ---------------------------------------------------------------------------
// // Shared sub-schemas
// // ---------------------------------------------------------------------------

// const SanityImageSchema = z.object({
//   // Fix 6: .nullable() added — Sanity returns asset:null for orphaned/deleted
//   // asset references. Without it, Zod throws and the whole fetch returns null.
//   asset: z.object({ _id: z.string(), url: z.string() }).optional().nullable(),
//   hotspot: z
//     .object({ x: z.number(), y: z.number(), height: z.number(), width: z.number() })
//     .optional()
//     .nullable(),
//   crop: z
//     .object({ top: z.number(), bottom: z.number(), left: z.number(), right: z.number() })
//     .optional()
//     .nullable(),
//   alt: z.string().optional().nullable(),
// })

// // ---------------------------------------------------------------------------
// // Faculty
// // ---------------------------------------------------------------------------

// const FacultySchema = z.object({
//   _id: z.string(),
//   name: z.string(),
//   photo: SanityImageSchema.optional().nullable(),
//   // Rule 5: subjects is array of strings
//   subjects: z.array(z.string()).optional().nullable(),
//   qualifications: z.string(),
//   yearsExperience: z.number(),
//   // Fix 10: strict z.string().url() rejected URLs without https:// scheme (e.g.
//   // linkedin.com/in/someone), causing a ZodError that silently wiped ALL faculty.
//   // Store as plain string; validate format in the UI/Studio instead.
//   linkedinUrl: z.string().optional().nullable(),
//   bio: z.string().optional().nullable(),
// })

// export type Faculty = z.infer<typeof FacultySchema>

// // ---------------------------------------------------------------------------
// // Testimonial
// // ---------------------------------------------------------------------------

// const TestimonialSchema = z.object({
//   _id: z.string(),
//   studentName: z.string(),
//   // Rule 8: photo is optional
//   photo: SanityImageSchema.optional().nullable(),
//   subject: z.string(),
//   // Rule 4: score 0-100
//   score: z.number().min(0).max(100),
//   // Rule 7: year min 2020, no max
//   year: z.number().min(2020),
//   quote: z.string(),
// })

// export type Testimonial = z.infer<typeof TestimonialSchema>

// // ---------------------------------------------------------------------------
// // Weekly Results
// // ---------------------------------------------------------------------------

// const TopStudentSchema = z.object({
//   // Rule 15: _key in array items
//   _key: z.string().optional(),
//   name: z.string(),
//   score: z.number().min(0).max(100),
// })

// const WeeklyResultSchema = z.object({
//   _id: z.string(),
//   date: z.string(),
//   testName: z.string(),
//   subject: z.string(),
//   classGroup: z.string(),
//   // Rule 15: array items include _key
//   topStudents: z.array(TopStudentSchema).optional().nullable(),
//   averageScore: z.number().min(0).max(100),
// })

// export type WeeklyResult = z.infer<typeof WeeklyResultSchema>

// // ---------------------------------------------------------------------------
// // Announcement
// // ---------------------------------------------------------------------------

// const AnnouncementSchema = z.object({
//   _id: z.string(),
//   title: z.string(),
//   date: z.string(),
//   description: z.string().optional().nullable(),
//   // Fix 11: .default('Normal') so that documents saved before urgency existed
//   // (or imported without the field) don't throw a ZodError and wipe all announcements.
//   urgency: z.enum(['Normal', 'Important', 'Urgent']).default('Normal'),
//   active: z.boolean(),
//   // Rule 6: expiryDate is optional
//   expiryDate: z.string().optional().nullable(),
// })

// export type Announcement = z.infer<typeof AnnouncementSchema>

// // ---------------------------------------------------------------------------
// // Blog Post
// // ---------------------------------------------------------------------------

// // Rule 10: body content blocks — loose schema for Portable Text
// const PortableTextBlockSchema = z.object({
//   _key: z.string().optional(),
//   _type: z.string(),
// }).passthrough()

// const BlogPostSchema = z.object({
//   _id: z.string(),
//   title: z.string(),
//   slug: z.object({ current: z.string() }),
//   metaDescription: z.string(),
//   coverImage: SanityImageSchema.optional().nullable(),
//   author: z.string(),
//   publishedDate: z.string(),
//   // Rule 15: body array items include _key
//   body: z.array(PortableTextBlockSchema).optional().nullable(),
//   // Fix 5: was z.array(z.string().optional()) which produced (string|undefined)[]
//   // — array elements are never undefined; the array itself is what's optional.
//   tags: z.array(z.string()).optional().nullable(),
// })

// export type BlogPost = z.infer<typeof BlogPostSchema>

// // Rule 16: MINIMAL blog post schema for generateStaticParams / sitemap
// const BlogPostMinimalSchema = z.object({
//   slug: z.object({ current: z.string() }),
//   publishedDate: z.string(),
// })

// export type BlogPostMinimal = z.infer<typeof BlogPostMinimalSchema>

// // ---------------------------------------------------------------------------
// // FAQ item (used inside Course and standalone)
// // ---------------------------------------------------------------------------

// const FaqItemSchema = z.object({
//   // Rule 15: _key in array items
//   _key: z.string().optional(),
//   question: z.string(),
//   answer: z.string(),
// })

// // ---------------------------------------------------------------------------
// // Course
// // ---------------------------------------------------------------------------

// const CourseSchema = z.object({
//   _id: z.string(),
//   courseName: z.string(),
//   // Rule 1: classGroup not stream
//   classGroup: z.enum(['class-11-12', 'class-9-10', 'class-5-8']),
//   subjectSlug: z.object({ current: z.string() }),
//   pageSummary: z.string(),
//   coverImage: SanityImageSchema.optional().nullable(),
//   // Fix 4: Sanity's of:[{type:'string'}] arrays return plain string[] from GROQ —
//   // NOT wrapped objects. The previous union z.object({_key}).or(z.string()) was
//   // structurally wrong and produced an unusable (object|string)[] type.
//   subjectsCovered: z.array(z.string()).optional().nullable(),
//   batchTimings: z.string(),
//   feeStructure: z.string().optional().nullable(),
//   faculty: FacultySchema.optional().nullable(),
//   // Rule 11: min 5, Rule 15: _key
//   faqs: z.array(FaqItemSchema),
//   brandedFramework: z.string().optional().nullable(),
// })

// export type Course = z.infer<typeof CourseSchema>

// // Rule 16: MINIMAL schema — only classGroup + subjectSlug
// const CourseMinimalSchema = z.object({
//   classGroup: z.string(),
//   subjectSlug: z.object({ current: z.string() }),
// })

// export type CourseMinimal = z.infer<typeof CourseMinimalSchema>

// // ---------------------------------------------------------------------------
// // Statistics
// // ---------------------------------------------------------------------------

// const StatisticsSchema = z.object({
//   _id: z.string(),
//   year: z.number().min(2020),   // Rule 7: no max
//   subject: z.string(),
//   classGroup: z.string(),
//   totalStudents: z.number(),
//   studentsAbove90: z.number(),
//   studentsAbove80: z.number(),
//   highestScore: z.number().min(0).max(100),   // Rule 4
//   topScorerName: z.string().optional().nullable(),
// })

// export type Statistics = z.infer<typeof StatisticsSchema>

// // ---------------------------------------------------------------------------
// // Global FAQ (standalone document)
// // ---------------------------------------------------------------------------

// const GlobalFaqSchema = z.object({
//   _id: z.string(),
//   question: z.string(),
//   answer: z.string(),
//   subject: z.string().optional().nullable(),
//   classGroup: z.string().optional().nullable(),
//   showOnHomepage: z.boolean(),
// })

// export type GlobalFaq = z.infer<typeof GlobalFaqSchema>

// // ===========================================================================
// // Query helpers
// // ===========================================================================

// // Rule 18: reusable image projection
// const IMAGE_PROJECTION = `{ asset->{_id, url}, hotspot, crop, alt }`

// // Rule 18 + 19: fetch options factory
// function fetchOptions(tags: string[]) {
//   return {
//     cache: 'force-cache' as RequestCache,
//     next: { tags },
//     // Rule 19: perspective published
//     perspective: 'published' as const,
//   }
// }

// // ===========================================================================
// // Course queries
// // ===========================================================================

// /**
//  * getCourse — fetch a single course by classGroup + subject slug.
//  * Rule 13: tags ['courses']
//  * Rule 14: try-catch, return null on failure
//  */
// export async function getCourse(
//   classGroup: string,
//   subject: string,
// ): Promise<Course | null> {
//   const query = `*[
//     _type == "course"
//     && classGroup == $classGroup
//     && subjectSlug.current == $subject
//   ][0]{
//     _id,
//     courseName,
//     classGroup,
//     subjectSlug,
//     pageSummary,
//     coverImage ${IMAGE_PROJECTION},
//     subjectsCovered,
//     batchTimings,
//     feeStructure,
//     faculty->{
//       _id,
//       name,
//       photo ${IMAGE_PROJECTION},
//       subjects,
//       qualifications,
//       yearsExperience,
//       linkedinUrl,
//       bio
//     },
//     faqs[]{
//       _key,
//       question,
//       answer
//     },
//     brandedFramework
//   }`

//   try {
//     const data = await sanityClient.fetch(query, { classGroup, subject }, fetchOptions(['courses']))
//     if (!data) return null
//     return CourseSchema.parse(data)
//   } catch (err) {
//     console.error('[getCourse] Error:', err)
//     return null
//   }
// }

// /**
//  * getAllCourses — minimal projection for generateStaticParams / sitemap.
//  * Rule 16: MINIMAL Zod schema — only classGroup + subjectSlug
//  * Rule 13: tags ['courses']
//  * Rule 14: try-catch, return [] on failure
//  */
// export async function getAllCourses(): Promise<CourseMinimal[]> {
//   const query = `*[_type == "course"]{
//     classGroup,
//     subjectSlug
//   }`

//   try {
//     const data = await sanityClient.fetch(query, {}, fetchOptions(['courses']))
//     return z.array(CourseMinimalSchema).parse(data)
//   } catch (err) {
//     console.error('[getAllCourses] Error:', err)
//     return []
//   }
// }

// // ===========================================================================
// // Testimonial queries
// // ===========================================================================

// /**
//  * getTestimonialsBySubject — filtered by subject.
//  * Rule 13: tags ['testimonials']
//  */
// export async function getTestimonialsBySubject(subject: string): Promise<Testimonial[]> {
//   const query = `*[_type == "testimonial" && subject == $subject] | order(_createdAt desc){
//     _id,
//     studentName,
//     photo ${IMAGE_PROJECTION},
//     subject,
//     score,
//     year,
//     quote
//   }`

//   try {
//     const data = await sanityClient.fetch(query, { subject }, fetchOptions(['testimonials']))
//     return z.array(TestimonialSchema).parse(data)
//   } catch (err) {
//     console.error('[getTestimonialsBySubject] Error:', err)
//     return []
//   }
// }

// // ===========================================================================
// // Weekly results queries
// // ===========================================================================

// /**
//  * getWeeklyResults — all results ordered by date desc.
//  * Fix 16: Uses safeParse so one malformed document doesn't wipe the entire
//  *         result set. If the full array parse fails, valid items are recovered
//  *         individually via flatMap. Guards against non-array data responses.
//  * Rule 13: tags ['results']
//  */
// export async function getWeeklyResults(): Promise<WeeklyResult[]> {
//   const query = `*[_type == "weeklyResults"] | order(date desc){
//     _id,
//     date,
//     testName,
//     subject,
//     classGroup,
//     topStudents[]{
//       _key,
//       name,
//       score
//     },
//     averageScore
//   }`

//   try {
//     const data = await sanityClient.fetch(query, {}, fetchOptions(['results']))
//     const parsed = z.array(WeeklyResultSchema).safeParse(data)
//     if (parsed.success) return parsed.data

//     // Fix 16: recover valid records individually — one bad document no longer
//     // silently empties the whole results list.
//     console.warn('[getWeeklyResults] Some records failed validation, filtering them out')
//     return Array.isArray(data)
//       ? data.flatMap((item: unknown) => {
//           const r = WeeklyResultSchema.safeParse(item)
//           return r.success ? [r.data] : []
//         })
//       : []
//   } catch (err) {
//     console.error('[getWeeklyResults] Error:', err)
//     return []
//   }
// }

// /**
//  * getLatestResultsPerSubject — most recent result per subject+classGroup.
//  * Fix 13: delegates to getWeeklyResults() — no duplicate GROQ query.
//  * Fix 3:  map key is `subject__classGroup` so Math class-11-12 and
//  *         Math class-9-10 are NOT merged into a single entry.
//  * Rule 13: tags ['results'] (inherited via getWeeklyResults)
//  */
// export async function getLatestResultsPerSubject(): Promise<Record<string, WeeklyResult>> {
//   try {
//     const results = await getWeeklyResults()   // Fix 13: no duplicate fetch
//     const map: Record<string, WeeklyResult> = {}
//     for (const result of results) {
//       // Fix 3: composite key preserves both class groups for duplicate subjects
//       const key = `${result.subject}__${result.classGroup}`
//       if (!map[key]) map[key] = result
//     }
//     return map
//   } catch (err) {
//     console.error('[getLatestResultsPerSubject] Error:', err)
//     return {}
//   }
// }

// // ===========================================================================
// // Announcement queries
// // ===========================================================================

// /**
//  * getActiveAnnouncements — active == true AND not expired.
//  * Rule 6: expiryDate == null || expiryDate > now()
//  * Rule 13: tags ['announcements']
//  */
// export async function getActiveAnnouncements(): Promise<Announcement[]> {
//   const query = `*[
//     _type == "announcement"
//     && active == true
//     && (expiryDate == null || expiryDate > now())
//   ] | order(date desc){
//     _id,
//     title,
//     date,
//     description,
//     urgency,
//     active,
//     expiryDate
//   }`

//   try {
//     const data = await sanityClient.fetch(query, {}, fetchOptions(['announcements']))
//     return z.array(AnnouncementSchema).parse(data)
//   } catch (err) {
//     console.error('[getActiveAnnouncements] Error:', err)
//     return []
//   }
// }

// // ===========================================================================
// // Blog post queries
// // ===========================================================================

// /**
//  * getBlogPost — single post by slug.
//  * Rule 13: tags ['blog']
//  */
// export async function getBlogPost(slug: string): Promise<BlogPost | null> {
//   const query = `*[_type == "blogPost" && slug.current == $slug][0]{
//     _id,
//     title,
//     slug,
//     metaDescription,
//     coverImage ${IMAGE_PROJECTION},
//     author,
//     publishedDate,
//     body[]{
//       ...,
//       _type == "image" => {
//         ...,
//         asset->{_id, url},
//         alt
//       }
//     },
//     tags
//   }`

//   try {
//     const data = await sanityClient.fetch(query, { slug }, fetchOptions(['blog']))
//     if (!data) return null
//     return BlogPostSchema.parse(data)
//   } catch (err) {
//     console.error('[getBlogPost] Error:', err)
//     return null
//   }
// }

// /**
//  * getAllBlogPosts — MINIMAL schema for generateStaticParams / sitemap.
//  * Rule 16: only slug + publishedDate
//  * Rule 13: tags ['blog']
//  */
// export async function getAllBlogPosts(): Promise<BlogPostMinimal[]> {
//   const query = `*[_type == "blogPost"] | order(publishedDate desc){
//     slug,
//     publishedDate
//   }`

//   try {
//     const data = await sanityClient.fetch(query, {}, fetchOptions(['blog']))
//     return z.array(BlogPostMinimalSchema).parse(data)
//   } catch (err) {
//     console.error('[getAllBlogPosts] Error:', err)
//     return []
//   }
// }

// // ===========================================================================
// // Faculty queries
// // ===========================================================================

// /**
//  * getAllFaculty — all faculty members.
//  * Rule 13: tags ['faculty']
//  */
// export async function getAllFaculty(): Promise<Faculty[]> {
//   const query = `*[_type == "faculty"] | order(name asc){
//     _id,
//     name,
//     photo ${IMAGE_PROJECTION},
//     subjects,
//     qualifications,
//     yearsExperience,
//     linkedinUrl,
//     bio
//   }`

//   try {
//     const data = await sanityClient.fetch(query, {}, fetchOptions(['faculty']))
//     return z.array(FacultySchema).parse(data)
//   } catch (err) {
//     console.error('[getAllFaculty] Error:', err)
//     return []
//   }
// }

// /**
//  * getFacultyForCourse — faculty referenced by a specific course document.
//  * Fix 1: The original query used `.faculty` chained after a projection object
//  *        which is invalid GROQ and always returned undefined. Correct form is
//  *        attribute access directly on the [0] result before the dereference.
//  * Fix 9: Tagged ['faculty','courses'] — course changes must also invalidate
//  *        this cache (e.g. when the faculty reference on a course is updated).
//  */
// export async function getFacultyForCourse(courseId: string): Promise<Faculty | null> {
//   const query = `*[_type == "course" && _id == $courseId][0].faculty->{
//     _id,
//     name,
//     photo { asset->{_id, url}, hotspot, crop, alt },
//     subjects,
//     qualifications,
//     yearsExperience,
//     linkedinUrl,
//     bio
//   }`

//   try {
//     const data = await sanityClient.fetch(
//       query,
//       { courseId },
//       fetchOptions(['faculty', 'courses']),   // Fix 9
//     )
//     if (!data) return null
//     return FacultySchema.parse(data)
//   } catch (err) {
//     console.error('[getFacultyForCourse] Error:', err)
//     return null
//   }
// }

// // ===========================================================================
// // Statistics queries
// // ===========================================================================

// /**
//  * getStatisticsBySubject — stat records for a subject within a class group.
//  * Fix 8: classGroup parameter added. Without it, "Mathematics" returned records
//  *        from BOTH class-11-12 and class-9-10 mixed together on a single page.
//  * Rule 13: tags ['statistics']
//  */
// export async function getStatisticsBySubject(
//   subject: string,
//   classGroup: string,
// ): Promise<Statistics[]> {
//   const query = `*[
//     _type == "statistics"
//     && subject == $subject
//     && classGroup == $classGroup
//   ] | order(year desc){
//     _id,
//     year,
//     subject,
//     classGroup,
//     totalStudents,
//     studentsAbove90,
//     studentsAbove80,
//     highestScore,
//     topScorerName
//   }`

//   try {
//     const data = await sanityClient.fetch(
//       query,
//       { subject, classGroup },
//       fetchOptions(['statistics']),
//     )
//     return z.array(StatisticsSchema).parse(data)
//   } catch (err) {
//     console.error('[getStatisticsBySubject] Error:', err)
//     return []
//   }
// }

// // ===========================================================================
// // Global FAQ queries
// // ===========================================================================

// /**
//  * getGlobalFAQs — FAQs shown on the homepage.
//  * Rule 13: tags ['faq']
//  */
// export async function getGlobalFAQs(): Promise<GlobalFaq[]> {
//   const query = `*[_type == "faq" && showOnHomepage == true] | order(_createdAt asc){
//     _id,
//     question,
//     answer,
//     subject,
//     classGroup,
//     showOnHomepage
//   }`

//   try {
//     const data = await sanityClient.fetch(query, {}, fetchOptions(['faq']))
//     return z.array(GlobalFaqSchema).parse(data)
//   } catch (err) {
//     console.error('[getGlobalFAQs] Error:', err)
//     return []
//   }
// }

/**
 * lib/queries.ts
 *
 * All GROQ queries and Zod validation schemas for the NGC Institute site.
 *
 * Rules enforced throughout:
 *  Rule 13 — cache: 'force-cache' + next: { tags: [...] } on every fetch
 *  Rule 14 — every query wrapped in try-catch; return null / [] on failure
 *  Rule 15 — all Zod array items include _key
 *  Rule 16 — getAllCourses uses MINIMAL Zod schema
 *  Rule 17 — generateStaticParams callers return [] on failure
 *  Rule 18 — image queries fetch asset->{_id,url}, hotspot, crop, alt
 *  Rule 19 — perspective: 'published' on all fetches
 */

import { z } from 'zod'
// Issue 41 fixed: @/ alias used consistently
import { sanityClient } from '@/lib/sanity'

// ===========================================================================
// Issue 39 fixed: exported CACHE_TAGS constant
// The revalidation webhook imports this to guarantee tag names always match
// what is used here. A typo in the webhook means revalidation does nothing.
// ===========================================================================
export const CACHE_TAGS = {
  courses:       'courses',
  testimonials:  'testimonials',
  results:       'results',
  announcements: 'announcements',
  blog:          'blog',
  faculty:       'faculty',
  statistics:    'statistics',
  faq:           'faq',
} as const

// ---------------------------------------------------------------------------
// Shared sub-schemas
// ---------------------------------------------------------------------------

const SanityImageSchema = z.object({
  asset: z.object({ _id: z.string(), url: z.string() }).optional().nullable(),
  hotspot: z
    .object({ x: z.number(), y: z.number(), height: z.number(), width: z.number() })
    .optional()
    .nullable(),
  crop: z
    .object({ top: z.number(), bottom: z.number(), left: z.number(), right: z.number() })
    .optional()
    .nullable(),
  alt: z.string().optional().nullable(),
})

// ---------------------------------------------------------------------------
// Faculty
// ---------------------------------------------------------------------------

const FacultySchema = z.object({
  _id: z.string(),
  name: z.string(),
  photo: SanityImageSchema.optional().nullable(),
  subjects: z.array(z.string()).optional().nullable(),
  // Issues 17 fixed: nullable — a faculty document missing these fields
  // must not crash the entire getCourse page or empty the faculty section.
  // The Sanity schema requires them but API imports can bypass validation.
  qualifications: z.string().optional().nullable(),
  yearsExperience: z.number().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
})

export type Faculty = z.infer<typeof FacultySchema>

// ---------------------------------------------------------------------------
// Testimonial
// ---------------------------------------------------------------------------

const TestimonialSchema = z.object({
  _id: z.string(),
  studentName: z.string(),
  photo: SanityImageSchema.optional().nullable(),
  subject: z.string(),
  // Issues 18 fixed: score and quote nullable — one bad testimonial must not
  // empty the entire testimonials section for a subject page
  score: z.number().min(0).max(100).optional().nullable(),
  year: z.number().min(2020).optional().nullable(),
  quote: z.string().optional().nullable(),
})

export type Testimonial = z.infer<typeof TestimonialSchema>

// ---------------------------------------------------------------------------
// Weekly Results
// ---------------------------------------------------------------------------

const TopStudentSchema = z.object({
  _key: z.string().optional(),
  name: z.string().optional().nullable(),
  score: z.number().min(0).max(100).optional().nullable(),
})

const WeeklyResultSchema = z.object({
  _id: z.string(),
  // Issues 19+20 fixed: all string fields nullable — one result missing a
  // field must not drop the entire week from the results page
  date: z.string().optional().nullable(),
  testName: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  classGroup: z.string().optional().nullable(),
  topStudents: z.array(TopStudentSchema).optional().nullable(),
  averageScore: z.number().min(0).max(100).optional().nullable(),
})

export type WeeklyResult = z.infer<typeof WeeklyResultSchema>

// ---------------------------------------------------------------------------
// Announcement
// ---------------------------------------------------------------------------

const AnnouncementSchema = z.object({
  _id: z.string(),
  // Issues 21+22 fixed: nullable fields + active default
  title: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  urgency: z.enum(['Normal', 'Important', 'Urgent']).default('Normal'),
  // Issue 22 fixed: default(true) so documents created before this field
  // existed do not crash the array parse and wipe all announcements
  active: z.boolean().default(true),
  expiryDate: z.string().optional().nullable(),
})

export type Announcement = z.infer<typeof AnnouncementSchema>

// ---------------------------------------------------------------------------
// Blog Post
// ---------------------------------------------------------------------------

const PortableTextBlockSchema = z.object({
  _key: z.string().optional(),
  _type: z.string(),
}).passthrough()

const BlogPostSchema = z.object({
  _id: z.string(),
  // Issues 23 fixed: all required string fields made nullable — a published
  // post missing any of these must not return a 404 to visitors or crawlers
  title: z.string().optional().nullable(),
  slug: z.object({ current: z.string() }),
  metaDescription: z.string().optional().nullable(),
  coverImage: SanityImageSchema.optional().nullable(),
  author: z.string().optional().nullable(),
  publishedDate: z.string().optional().nullable(),
  body: z.array(PortableTextBlockSchema).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
})

export type BlogPost = z.infer<typeof BlogPostSchema>

// Issue 24 fixed: publishedDate nullable in minimal schema
// One post missing publishedDate must not break generateStaticParams for ALL posts
const BlogPostMinimalSchema = z.object({
  slug: z.object({ current: z.string() }),
  publishedDate: z.string().optional().nullable(),
})

export type BlogPostMinimal = z.infer<typeof BlogPostMinimalSchema>

// ---------------------------------------------------------------------------
// FAQ item (used inside Course and standalone)
// ---------------------------------------------------------------------------

const FaqItemSchema = z.object({
  _key: z.string().optional(),
  question: z.string(),
  answer: z.string(),
})

// ---------------------------------------------------------------------------
// Course
// ---------------------------------------------------------------------------

const CourseSchema = z.object({
  _id: z.string(),
  courseName: z.string(),
  // Issue 28 fixed: .catch() provides a safe fallback instead of throwing
  // when an invalid classGroup value reaches Zod. Without this, one course
  // document with a malformed classGroup causes that subject page to
  // permanently return 404 regardless of how many times it is loaded.
  classGroup: z
    .enum(['class-11-12', 'class-9-10', 'class-5-8'])
    .catch('class-11-12'),
  subjectSlug: z.object({ current: z.string() }),
  // Issues 25 fixed: pageSummary and batchTimings nullable
  pageSummary: z.string().optional().nullable(),
  coverImage: SanityImageSchema.optional().nullable(),
  subjectsCovered: z.array(z.string()).optional().nullable(),
  batchTimings: z.string().optional().nullable(),
  feeStructure: z.string().optional().nullable(),
  // Issue 29 fixed: nested FacultySchema uses nullable fields throughout
  // so an incomplete faculty profile does not crash the entire course page
  faculty: FacultySchema.optional().nullable(),
  // Issue 34 fixed: min(1) ensures at least one FAQ exists before rendering
  // FAQPage JSON-LD — an empty array produces invalid structured data
  faqs: z.array(FaqItemSchema).min(1).optional().default([]),
  brandedFramework: z.string().optional().nullable(),
})

export type Course = z.infer<typeof CourseSchema>

// Issue 33 fixed: CourseMinimalSchema also validates classGroup as enum
// so phantom routes from invalid values are caught before generateStaticParams
// builds URLs that the page route cannot serve
const CourseMinimalSchema = z.object({
  classGroup: z
    .enum(['class-11-12', 'class-9-10', 'class-5-8'])
    .catch('class-11-12'),
  subjectSlug: z.object({ current: z.string() }),
})

export type CourseMinimal = z.infer<typeof CourseMinimalSchema>

// Issue 40 fixed: mid-weight schema for course listing pages
// getAllCourses (minimal) lacks courseName and coverImage needed for listing.
// Full getCourse fetches all fields including body — too heavy for index pages.
const CourseListingSchema = z.object({
  _id: z.string(),
  courseName: z.string(),
  classGroup: z
    .enum(['class-11-12', 'class-9-10', 'class-5-8'])
    .catch('class-11-12'),
  subjectSlug: z.object({ current: z.string() }),
  pageSummary: z.string().optional().nullable(),
  coverImage: SanityImageSchema.optional().nullable(),
  batchTimings: z.string().optional().nullable(),
})

export type CourseListing = z.infer<typeof CourseListingSchema>

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

const StatisticsSchema = z.object({
  _id: z.string(),
  year: z.number().min(2020),
  subject: z.string(),
  classGroup: z.string(),
  // Issues 4 fixed: nullable — one statistics document missing a number
  // field must not empty the statistics section for that subject page
  totalStudents: z.number().optional().nullable(),
  studentsAbove90: z.number().optional().nullable(),
  studentsAbove80: z.number().optional().nullable(),
  highestScore: z.number().min(0).max(100).optional().nullable(),
  topScorerName: z.string().optional().nullable(),
})

export type Statistics = z.infer<typeof StatisticsSchema>

// ---------------------------------------------------------------------------
// Global FAQ (standalone document)
// ---------------------------------------------------------------------------

const GlobalFaqSchema = z.object({
  _id: z.string(),
  // Issues 26+27 fixed: question and answer nullable, showOnHomepage has default
  question: z.string().optional().nullable(),
  answer: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  classGroup: z.string().optional().nullable(),
  // Issue 27 fixed: default(false) — FAQ documents created before this field
  // existed return undefined which z.boolean() throws on, wiping all homepage FAQs
  showOnHomepage: z.boolean().default(false),
})

export type GlobalFaq = z.infer<typeof GlobalFaqSchema>

// ===========================================================================
// Query helpers
// ===========================================================================

// Issue 37 fixed: IMAGE_PROJECTION constant used everywhere including
// getFacultyForCourse — if projection ever changes, all queries update together
const IMAGE_PROJECTION = `{ asset->{_id, url}, hotspot, crop, alt }`

function fetchOptions(tags: string[]) {
  return {
    // Issue 42 noted: cache:'force-cache' + next:{tags} is redundant —
    // next.tags implies force-cache. Both are kept for explicit clarity
    // and forward compatibility if Next.js caching defaults change.
    cache: 'force-cache' as RequestCache,
    next: { tags },
    perspective: 'published' as const,
  }
}

// ---------------------------------------------------------------------------
// safeParse helper for arrays — recovers valid records when one document fails
// ---------------------------------------------------------------------------
function safeParseArray<T>(
  schema: z.ZodType<T>,
  data: unknown,
  queryName: string,
): T[] {
  const parsed = z.array(schema).safeParse(data)
  if (parsed.success) return parsed.data

  // Issue 30 fixed: one bad document must not empty the entire collection.
  // Recover valid records individually so a staff mistake in one document
  // does not silently blank an entire section of the live site.
  console.warn(
    `[${queryName}] Some records failed Zod validation, filtering them out. ` +
    `Check Sanity documents for missing required fields.`,
  )
  return Array.isArray(data)
    ? data.flatMap((item: unknown) => {
        const r = schema.safeParse(item)
        return r.success ? [r.data] : []
      })
    : []
}

// ===========================================================================
// Course queries
// ===========================================================================

export async function getCourse(
  classGroup: string,
  subject: string,
): Promise<Course | null> {
  const query = `*[
    _type == "course"
    && classGroup == $classGroup
    && subjectSlug.current == $subject
  ][0]{
    _id,
    courseName,
    classGroup,
    subjectSlug,
    pageSummary,
    coverImage ${IMAGE_PROJECTION},
    subjectsCovered,
    batchTimings,
    feeStructure,
    faculty->{
      _id,
      name,
      photo ${IMAGE_PROJECTION},
      subjects,
      qualifications,
      yearsExperience,
      linkedinUrl,
      bio
    },
    faqs[]{
      _key,
      question,
      answer
    },
    brandedFramework
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      { classGroup, subject },
      fetchOptions([CACHE_TAGS.courses]),
    )
    if (!data) return null

    // Issue 31 fixed: safeParse gives field-level diagnostics instead of
    // throwing a verbose ZodError that obscures which field actually failed
    const parsed = CourseSchema.safeParse(data)
    if (!parsed.success) {
      console.error('[getCourse] Validation failed:', parsed.error.issues)
      return null
    }
    return parsed.data
  } catch (err) {
    console.error('[getCourse] Error:', err)
    return null
  }
}

export async function getAllCourses(): Promise<CourseMinimal[]> {
  const query = `*[_type == "course"]{
    classGroup,
    subjectSlug
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      {},
      fetchOptions([CACHE_TAGS.courses]),
    )
    return safeParseArray(CourseMinimalSchema, data, 'getAllCourses')
  } catch (err) {
    console.error('[getAllCourses] Error:', err)
    return []
  }
}

// Issue 40 fixed: mid-weight query for course listing pages
// Fetches courseName and coverImage which the minimal schema lacks,
// without fetching FAQs and full faculty which the full schema includes
export async function getAllCoursesForListing(): Promise<CourseListing[]> {
  const query = `*[_type == "course"] | order(classGroup asc, courseName asc){
    _id,
    courseName,
    classGroup,
    subjectSlug,
    pageSummary,
    coverImage ${IMAGE_PROJECTION},
    batchTimings
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      {},
      fetchOptions([CACHE_TAGS.courses]),
    )
    return safeParseArray(CourseListingSchema, data, 'getAllCoursesForListing')
  } catch (err) {
    console.error('[getAllCoursesForListing] Error:', err)
    return []
  }
}

// ===========================================================================
// Testimonial queries
// ===========================================================================

export async function getTestimonialsBySubject(subject: string): Promise<Testimonial[]> {
  // Issue 32 fixed: lower() on both sides so "Accounts" matches "accounts"
  // Staff enter subject names as free text — case will vary
  const query = `*[_type == "testimonial" && lower(subject) == lower($subject)] | order(_createdAt desc){
    _id,
    studentName,
    photo ${IMAGE_PROJECTION},
    subject,
    score,
    year,
    quote
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      { subject },
      fetchOptions([CACHE_TAGS.testimonials]),
    )
    return safeParseArray(TestimonialSchema, data, 'getTestimonialsBySubject')
  } catch (err) {
    console.error('[getTestimonialsBySubject] Error:', err)
    return []
  }
}

// ===========================================================================
// Weekly results queries
// ===========================================================================

// Issue 36 fixed: limit parameter prevents unbounded growth as weekly tests
// accumulate. Default covers ~1 year of weekly tests across all subjects.
export async function getWeeklyResults(limit = 200): Promise<WeeklyResult[]> {
  const query = `*[_type == "weeklyResults"] | order(date desc)[0...$limit]{
    _id,
    date,
    testName,
    subject,
    classGroup,
    topStudents[]{
      _key,
      name,
      score
    },
    averageScore
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      { limit },
      fetchOptions([CACHE_TAGS.results]),
    )
    return safeParseArray(WeeklyResultSchema, data, 'getWeeklyResults')
  } catch (err) {
    console.error('[getWeeklyResults] Error:', err)
    return []
  }
}

// Issue 35 fixed: returns WeeklyResult[] not Record<string, WeeklyResult>
// Callers expect arrays throughout — returning a Record means .map() fails
// with "undefined is not a function" on every page that uses this data
export async function getLatestResultsPerSubject(): Promise<WeeklyResult[]> {
  try {
    const results = await getWeeklyResults()
    const map: Record<string, WeeklyResult> = {}
    for (const result of results) {
      // Composite key preserves both class groups for duplicate subject names
      // e.g. Mathematics exists in class-11-12 AND class-9-10
      const key = `${result.subject ?? 'unknown'}__${result.classGroup ?? 'unknown'}`
      if (!map[key]) map[key] = result
    }
    // Return array — consistent with all other query function return types
    return Object.values(map)
  } catch (err) {
    console.error('[getLatestResultsPerSubject] Error:', err)
    return []
  }
}

// ===========================================================================
// Announcement queries
// ===========================================================================

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const query = `*[
    _type == "announcement"
    && active == true
    && (expiryDate == null || expiryDate > now())
  ] | order(date desc){
    _id,
    title,
    date,
    description,
    urgency,
    active,
    expiryDate
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      {},
      fetchOptions([CACHE_TAGS.announcements]),
    )
    return safeParseArray(AnnouncementSchema, data, 'getActiveAnnouncements')
  } catch (err) {
    console.error('[getActiveAnnouncements] Error:', err)
    return []
  }
}

// ===========================================================================
// Blog post queries
// ===========================================================================

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const query = `*[_type == "blogPost" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    metaDescription,
    coverImage ${IMAGE_PROJECTION},
    author,
    publishedDate,
    body[]{
      ...,
      _type == "image" => {
        ...,
        asset->{_id, url},
        alt
      }
    },
    tags
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      { slug },
      fetchOptions([CACHE_TAGS.blog]),
    )
    if (!data) return null

    const parsed = BlogPostSchema.safeParse(data)
    if (!parsed.success) {
      console.error('[getBlogPost] Validation failed:', parsed.error.issues)
      return null
    }
    return parsed.data
  } catch (err) {
    console.error('[getBlogPost] Error:', err)
    return null
  }
}

export async function getAllBlogPosts(): Promise<BlogPostMinimal[]> {
  const query = `*[_type == "blogPost"] | order(publishedDate desc){
    slug,
    publishedDate
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      {},
      fetchOptions([CACHE_TAGS.blog]),
    )
    return safeParseArray(BlogPostMinimalSchema, data, 'getAllBlogPosts')
  } catch (err) {
    console.error('[getAllBlogPosts] Error:', err)
    return []
  }
}

// ===========================================================================
// Faculty queries
// ===========================================================================

export async function getAllFaculty(): Promise<Faculty[]> {
  const query = `*[_type == "faculty"] | order(name asc){
    _id,
    name,
    photo ${IMAGE_PROJECTION},
    subjects,
    qualifications,
    yearsExperience,
    linkedinUrl,
    bio
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      {},
      fetchOptions([CACHE_TAGS.faculty]),
    )
    return safeParseArray(FacultySchema, data, 'getAllFaculty')
  } catch (err) {
    console.error('[getAllFaculty] Error:', err)
    return []
  }
}

export async function getFacultyForCourse(courseId: string): Promise<Faculty | null> {
  // Issue 37 fixed: IMAGE_PROJECTION constant used instead of inline string
  const query = `*[_type == "course" && _id == $courseId][0].faculty->{
    _id,
    name,
    photo ${IMAGE_PROJECTION},
    subjects,
    qualifications,
    yearsExperience,
    linkedinUrl,
    bio
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      { courseId },
      fetchOptions([CACHE_TAGS.faculty, CACHE_TAGS.courses]),
    )
    if (!data) return null

    const parsed = FacultySchema.safeParse(data)
    if (!parsed.success) {
      console.error('[getFacultyForCourse] Validation failed:', parsed.error.issues)
      return null
    }
    return parsed.data
  } catch (err) {
    console.error('[getFacultyForCourse] Error:', err)
    return null
  }
}

// ===========================================================================
// Statistics queries
// ===========================================================================

export async function getStatisticsBySubject(
  subject: string,
  classGroup: string,
): Promise<Statistics[]> {
  // Issue 32 fixed: lower() on subject — "Accounts" must match "accounts"
  const query = `*[
    _type == "statistics"
    && lower(subject) == lower($subject)
    && classGroup == $classGroup
  ] | order(year desc){
    _id,
    year,
    subject,
    classGroup,
    totalStudents,
    studentsAbove90,
    studentsAbove80,
    highestScore,
    topScorerName
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      { subject, classGroup },
      fetchOptions([CACHE_TAGS.statistics]),
    )
    return safeParseArray(StatisticsSchema, data, 'getStatisticsBySubject')
  } catch (err) {
    console.error('[getStatisticsBySubject] Error:', err)
    return []
  }
}

// ===========================================================================
// Global FAQ queries
// ===========================================================================

export async function getGlobalFAQs(): Promise<GlobalFaq[]> {
  const query = `*[_type == "faq" && showOnHomepage == true] | order(_createdAt asc){
    _id,
    question,
    answer,
    subject,
    classGroup,
    showOnHomepage
  }`

  try {
    const data = await sanityClient.fetch(
      query,
      {},
      fetchOptions([CACHE_TAGS.faq]),
    )
    return safeParseArray(GlobalFaqSchema, data, 'getGlobalFAQs')
  } catch (err) {
    console.error('[getGlobalFAQs] Error:', err)
    return []
  }
}