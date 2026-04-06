import { defineField, defineType } from 'sanity'

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: R => R.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
    }),

    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'string',
      description: 'Used for SEO. Maximum 160 characters.',
      validation: R => R.required().max(160),
    }),

    // Rule 3: image with nested alt (required)
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: R => R.required(),
        }),
      ],
      validation: R => R.required(),
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: R => R.required(),
    }),

    defineField({
      name: 'publishedDate',
      title: 'Published Date',
      type: 'date',
      validation: R => R.required(),
    }),

    // Rule 10: body Portable Text with image type that has nested alt text.
    // Fix 15: body is now required — prevents publishing empty blog posts.
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: R => R.required(),
            }),
          ],
        },
      ],
      validation: R => R.required(),
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
})