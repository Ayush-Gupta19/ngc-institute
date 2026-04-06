import { defineField, defineType } from 'sanity'

export const announcement = defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: R => R.required(),
    }),

    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: R => R.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),

    defineField({
      name: 'urgency',
      title: 'Urgency',
      type: 'string',
      options: {
        list: [
          { title: 'Normal',    value: 'Normal'    },
          { title: 'Important', value: 'Important' },
          { title: 'Urgent',    value: 'Urgent'    },
        ],
        layout: 'radio',
      },
      initialValue: 'Normal',
      validation: R => R.required(),
    }),

    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      validation: R => R.required(),
    }),

    // Rule 6: expiryDate is optional date field
    defineField({
      name: 'expiryDate',
      title: 'Expiry Date',
      type: 'date',
      description: 'Leave blank if the announcement does not expire.',
    }),
  ],
})