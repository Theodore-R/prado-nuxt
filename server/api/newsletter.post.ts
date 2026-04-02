import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { sendEmail, escapeHtml } from '~/server/utils/email'
import { validateBody, newsletterSchema } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const { email, structure, source } = await validateBody(event, newsletterSchema)

  const config = useRuntimeConfig()
  const adminClient = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  const { data: existing, error: existingError } = await adminClient
    .from('newsletter_subscribers')
    .select('email, confirmed_at, confirmation_token')
    .eq('email', email)
    .maybeSingle()

  if (existingError) {
    throw createError({ statusCode: 500, message: existingError.message })
  }

  let token = existing?.confirmation_token ?? randomUUID()

  if (!existing) {
    const { error } = await adminClient.from('newsletter_subscribers').insert({
      email, structure: structure ?? null, source: source ?? 'website', confirmation_token: token,
    })
    if (error) throw createError({ statusCode: 500, message: error.message })
  } else {
    // Only update fields that were provided
    const updatePayload: Record<string, any> = {}
    if (typeof structure !== 'undefined') updatePayload.structure = structure ?? null
    if (typeof source !== 'undefined') updatePayload.source = source
    // Persist token if legacy row has none
    if (!existing.confirmed_at && !existing.confirmation_token) {
      updatePayload.confirmation_token = token
    }
    if (Object.keys(updatePayload).length > 0) {
      const { error } = await adminClient.from('newsletter_subscribers')
        .update(updatePayload)
        .eq('email', email)
      if (error) throw createError({ statusCode: 500, message: error.message })
    }
  }

  // Send confirmation email only if not yet confirmed
  if (!existing?.confirmed_at) {
    // Ensure token is persisted for legacy rows
    if (existing && !existing.confirmation_token) {
      await adminClient.from('newsletter_subscribers')
        .update({ confirmation_token: token })
        .eq('email', email)
    }

    const baseUrl = getRequestURL(event).origin
    const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`

    const html = `
    <div style="background:#f6f5f3;padding:32px 16px;font-family:Arial,sans-serif;color:#1f1f1f;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e1d8;border-radius:12px;padding:24px;">
        <p style="margin:0 0 12px;font-size:16px;">Bonjour,</p>
        <p style="margin:0 0 16px;font-size:16px;">Merci pour votre inscription à la newsletter Prado Itinéraires.</p>
        <p style="margin:0 0 16px;">
          <a href="${confirmUrl}" style="display:inline-block;background:#FB6223;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:999px;font-size:14px;">
            Confirmer mon inscription
          </a>
        </p>
        <p style="margin:0;font-size:12px;color:#6b6b6b;">Si le bouton ne fonctionne pas : ${escapeHtml(confirmUrl)}</p>
      </div>
    </div>`

    await sendEmail(email, 'Confirmez votre inscription à la newsletter', html)
  }

  return { success: true }
})
