import { defineField, defineType } from 'sanity'

export const faculty = defineType({
  name: 'faculty',
  title: 'Faculty',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: R => R.required(),
    }),

    // Rule 3: image with nested alt (required)
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
          validation: R => R.required(),
        }),
      ],
      validation: R => R.required(),
    }),

    // Rule 5: subjects is array of strings
    defineField({
      name: 'subjects',
      title: 'Subjects Taught',
      type: 'array',
      of: [{ type: 'string' }],
      validation: R => R.required().min(1),
    }),

    defineField({
      name: 'qualifications',
      title: 'Qualifications',
      type: 'string',
      validation: R => R.required(),
    }),

    defineField({
      name: 'yearsExperience',
      title: 'Years of Experience',
      type: 'number',
      validation: R => R.required().min(0),
    }),

    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
    }),

    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
    }),
  ],
})