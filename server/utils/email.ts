import { Resend } from 'resend'
import { getSettings } from '~/server/utils/settings'

const FALLBACK_FROM = 'Prado Itinéraires <noreply@prado-itineraires.fr>'

let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (resendClient) return resendClient
  const config = useRuntimeConfig()
  if (!config.resendApiKey) {
    throw new Error('RESEND_API_KEY manquant')
  }
  resendClient = new Resend(config.resendApiKey)
  return resendClient
}

async function getSenderFrom(): Promise<string> {
  try {
    const emailSettings = await getSettings<{ senderName?: string; senderEmail?: string }>('email')
    if (emailSettings.senderName && emailSettings.senderEmail) {
      return `${emailSettings.senderName} <${emailSettings.senderEmail}>`
    }
  } catch {
    // Fall back to default if settings table doesn't exist yet
  }
  return FALLBACK_FROM
}

export async function sendEmail(to: string | string[], subject: string, html: string) {
  const resend = getResendClient()
  const from = await getSenderFrom()

  let replyTo: string | undefined
  try {
    const emailSettings = await getSettings<{ replyToEmail?: string }>('email')
    replyTo = emailSettings.replyToEmail || undefined
  } catch {
    // ignore
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { reply_to: replyTo } : {}),
  })
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char)
  )
}

export function formatDateFr(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
