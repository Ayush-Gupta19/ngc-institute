import { defineField, defineType } from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
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

    defineField({
      name: 'subject',
      title: 'Subject',
      type: 'string',
    }),

    // Rule 1: classGroup not stream
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
      },
    }),

    defineField({
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})