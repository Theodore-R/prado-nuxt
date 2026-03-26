import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secretKey = config.veriffSecretKey

  if (!secretKey) {
    throw createError({ statusCode: 500, message: 'Veriff secret key not configured' })
  }

  // Read raw body for HMAC verification
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, message: 'Empty body' })
  }

  // Verify HMAC signature
  const signature = getHeader(event, 'x-hmac-signature')
  const authClient = getHeader(event, 'x-auth-client')

  if (!signature) {
    throw createError({ statusCode: 401, message: 'Missing HMAC signature' })
  }

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawBody)
    .digest('hex')

  if (signature !== expectedSignature) {
    throw createError({ statusCode: 401, message: 'Invalid HMAC signature' })
  }

  const body = JSON.parse(rawBody)
  const verification = body.verification

  if (!verification) {
    return { received: true }
  }

  // Only process decision webhooks (codes 9001, 9102, 9103, 9104)
  const code = verification.code
  const vendorData = verification.vendorData // This is the jeune ID
  const sessionId = verification.id

  if (!vendorData || !sessionId) {
    return { received: true }
  }

  const adminClient = createClient(
    config.public.supabase.url,
    config.supabaseServiceRoleKey,
  )

  // Code 9001 = approved
  if (code === 9001) {
    await adminClient
      .from('jeunes')
      .update({ identity_verified: true })
      .eq('id', vendorData)
      .eq('veriff_session_id', sessionId)
  }

  // For declined (9102), expired (9104), we keep identity_verified as false
  // For resubmission_requested (9103), the user can retry

  return { received: true }
})
