import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.E2E_SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase URL or service role key for E2E tests. Set E2E_SUPABASE_URL and E2E_SUPABASE_SERVICE_ROLE_KEY.')
}

export const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
