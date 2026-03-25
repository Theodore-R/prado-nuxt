import { requireAdmin } from '~/server/utils/admin'

function csvEscape(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export default defineEventHandler(async (event) => {
  const adminClient = await requireAdmin(event)

  const { data, error } = await adminClient
    .from('contact_messages')
    .select('created_at, name, email, subject, message, is_read')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  const header = 'date,nom,email,sujet,message,lu'
  const rows = (data ?? []).map(row =>
    [row.created_at, row.name, row.email, row.subject, row.message, row.is_read ? 'Oui' : 'Non'].map(csvEscape).join(',')
  )

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="contacts.csv"')
  return [header, ...rows].join('\n')
})
