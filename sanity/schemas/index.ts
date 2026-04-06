// This file MUST export all schemas as schemaTypes.
// Without it, Sanity Studio has zero document types and staff cannot
// create or edit any content.

import { faculty }       from './faculty'
import { testimonial }   from './testimonial'
import { weeklyResults } from './weeklyResults'
import { announcement }  from './announcement'
import { blogPost }      from './blogPost'
import { course }        from './course'
import { statistics }    from './statistics'
import { faq }           from './faq'

export const schemaTypes = [
  faculty,
  testimonial,
  weeklyResults,
  announcement,
  blogPost,
  course,
  statistics,
  faq,
]