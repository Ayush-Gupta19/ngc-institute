import { defineField, defineType } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'studentName',
      title: 'Student Name',
      type: 'string',
      validation: R => R.required(),
    }),

    // Rule 8: photo is OPTIONAL — no required() validation
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          // alt is optional because photo itself is optional
        }),
      ],
    }),

    defineField({
      name: 'subject',
      title: 'Subject',
      type: 'string',
      validation: R => R.required(),
    }),

    // Rule 4: score is number with min/max
    defineField({
      name: 'score',
      title: 'Score (%)',
      type: 'number',
      validation: R => R.required().min(0).max(100),
    }),

    // Rule 7: year has min 2020 and NO max
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: R => R.required().min(2020),
    }),

    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      validation: R => R.required(),
    }),
  ],
})