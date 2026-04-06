import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas/index'

// Issue 11 fixed: runtime guard — fail loudly if env var is missing rather
// than passing undefined to Sanity which produces a confusing "invalid project"
// error that is hard to diagnose in production logs
const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??
  process.env.SANITY_PROJECT_ID

if (!projectId) {
  throw new Error(
    '[sanity.config] Missing SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID env var',
  )
}

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ??
  process.env.SANITY_DATASET ??
  'production'

export default defineConfig({
  name: 'default',
  title: 'NGC Institute CMS',
  projectId,
  dataset,
  plugins: [
    structureTool(),
    // Issue 10 fixed: visionTool only in non-production environments.
    // In production, any logged-in Sanity user can run arbitrary GROQ
    // queries against the entire dataset. For a staff CMS this is a
    // low-but-real information disclosure risk.
    ...(process.env.NODE_ENV !== 'production' ? [visionTool()] : []),
  ],
  schema: { types: schemaTypes },
})