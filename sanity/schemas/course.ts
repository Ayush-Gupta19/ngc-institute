import { defineField, defineType } from 'sanity'

export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({
      name: 'courseName',
      title: 'Course Name',
      type: 'string',
      validation: R => R.required(),
    }),

    // classGroup NOT stream — this is the URL segment
    defineField({
      name: 'classGroup',
      title: 'Class Group',
      type: 'string',
      options: {
        list: [
          { title: 'Class 11-12', value: 'class-11-12' },
          { title: 'Class 9-10',  value: 'class-9-10'  },
          { title: 'Class 5-8',   value: 'class-5-8'   },
        ],
        layout: 'radio',
      },
      validation: R => R.required(),
    }),

    defineField({
      name: 'subjectSlug',
      title: 'Subject Slug',
      type: 'slug',
      description:
        'WARNING: Never change this after first publish. ' +
        'Changing the slug breaks the URL and loses Google rankings.',
      options: {
        // Issue 12 fixed: custom source disambiguates Mathematics and English
        // (the only subjects that exist in multiple class groups) by appending
        // the class group suffix. All other subjects use their simple name.
        source: (doc: any) => {
          const name  = (doc.courseName ?? '').trim()
          const group = (doc.classGroup ?? '').replace('class-', '')
          const duplicates = ['Mathematics', 'English']
          return duplicates.includes(name) ? `${name}-${group}` : name
        },
        maxLength: 96,
        // Issue 12 fixed: slugify forces lowercase and strips special characters
        // so manually typed slugs match URL parameters which are always lowercase.
        // Without this, "Mathematics-11-12" ≠ "mathematics-11-12" and the page 404s.
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, ''),
      },
      validation: R => R.required(),
    }),

    defineField({
      name: 'pageSummary',
      title: 'AI Summary (2-3 sentences with real stats)',
      type: 'text',
      description: 'Shown in AI search results and meta descriptions. Maximum 400 characters.',
      validation: R => R.required().max(400),
    }),

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
          validation: R =>
            R.custom((val) =>
              val ? true : 'Alt text is strongly recommended for accessibility',
            ).warning(),
        }),
      ],
    }),

    defineField({
      name: 'subjectsCovered',
      title: 'Subjects / Topics Covered',
      type: 'array',
      of: [{ type: 'string' }],
      validation: R => R.required().min(1),
    }),

    defineField({
      name: 'batchTimings',
      title: 'Batch Timings',
      type: 'string',
      validation: R => R.required(),
    }),

    defineField({
      name: 'feeStructure',
      title: 'Fee Structure',
      type: 'string',
    }),

    defineField({
      name: 'faculty',
      title: 'Faculty',
      type: 'reference',
      to: [{ type: 'faculty' }],
      validation: R => R.required(),
    }),

    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          preview: { select: { title: 'question' } },
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: R => R.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              validation: R => R.required(),
            }),
          ],
        },
      ],
      validation: R =>
        R.required()
          .min(5)
          .error('Add at least 5 FAQs for SEO compliance'),
    }),

    defineField({
      name: 'brandedFramework',
      title: 'Branded Framework',
      type: 'text',
    }),
  ],
})