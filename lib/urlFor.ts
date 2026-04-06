import imageUrlBuilder from '@sanity/image-url'
// Issue 15 fixed: use @/ alias consistently with the rest of the project
import { sanityClient } from '@/lib/sanity'

const builder = imageUrlBuilder(sanityClient)

/**
 * Build a Sanity image URL from a Sanity image field value.
 *
 * ALWAYS call .url() at the end: urlFor(source).url()
 *
 * Issue 14 fixed: null guard added.
 * coverImage and photo are optional fields throughout the CMS.
 * Calling urlFor(null) or urlFor(undefined) without this guard throws
 * an uncaught error that crashes the component rendering the image.
 * Check that the image exists before calling urlFor:
 *
 *   {course.coverImage?.asset && (
 *     <Image src={urlFor(course.coverImage).url()} ... />
 *   )}
 */
export function urlFor(source: any) {
  if (!source?.asset) {
    throw new Error(
      '[urlFor] called with null, undefined, or an image missing its asset reference. ' +
      'Always check that the image field exists before calling urlFor().',
    )
  }
  return builder.image(source)
}