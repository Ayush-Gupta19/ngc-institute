import { defineField, defineType } from 'sanity'

export const statistics = defineType({
  name: 'statistics',
  title: 'Statistics',
  type: 'document',
  fields: [
    // Rule 7: min 2020, NO max — never add max year
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: R => R.required().min(2020),
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
      name: 'totalStudents',
      title: 'Total Students',
      type: 'number',
      validation: R => R.required().min(0),
    }),

    defineField({
      name: 'studentsAbove90',
      title: 'Students Scoring Above 90%',
      type: 'number',
      validation: R => R.required().min(0),
    }),

    defineField({
      name: 'studentsAbove80',
      title: 'Students Scoring Above 80%',
      type: 'number',
      validation: R => R.required().min(0),
    }),

    // Rule 4: score fields are number with min/max
    defineField({
      name: 'highestScore',
      title: 'Highest Score (%)',
      type: 'number',
      validation: R => R.required().min(0).max(100),
    }),

    defineField({
      name: 'topScorerName',
      title: 'Top Scorer Name',
      type: 'string',
    }),
  ],
})