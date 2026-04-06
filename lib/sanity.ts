import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  // Issue 13 fixed: token is only attached on the server where it is needed
  // for fetching draft content. On the browser (typeof window !== 'undefined'),
  // no token is passed — published content requires no auth on a public dataset.
  // This prevents the token from being serialized into client JS bundles
  // if any Client Component ever imports a module that depends on this client.
  token: typeof window === 'undefined' ? process.env.SANITY_API_TOKEN : undefined,
  useCdn: false,
})