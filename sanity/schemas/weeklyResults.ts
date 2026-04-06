import { defineField, defineType } from 'sanity'

export const weeklyResults = defineType({
  name: 'weeklyResults',
  title: 'Weekly Results',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: R => R.required(),
    }),

    defineField({
      name: 'testName',
      title: 'Test Name',
      type: 'string',
      validation: R => R.required(),
    }),

    defineField({
      name: 'subject',
      title: 'Subject',
      type: 'string',
      validation: R => R.required(),
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
      validation: R => R.required(),
    }),

    defineField({
      name: 'topStudents',
      title: 'Top Students',
      type: 'array',
      of: [
        {
          type: 'object',
          // Fix 14: name + preview so Studio shows student name instead of "Object"
          name: 'topStudent',
          preview: { select: { title: 'name', subtitle: 'score' } },
          fields: [
            defineField({
              name: 'name',
              title: 'Student Name',
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
          ],
        },
      ],
    }),

    // Rule 4: averageScore is number with min/max
    defineField({
      name: 'averageScore',
      title: 'Average Score (%)',
      type: 'number',
      validation: R => R.required().min(0).max(100),
    }),
  ],
})