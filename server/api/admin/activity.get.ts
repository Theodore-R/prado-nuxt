import { requireAdmin } from '~/server/utils/admin'

interface ActivityItem {
  type: 'inscription' | 'prescripteur' | 'contact' | 'newsletter'
  label: string
  detail: string
  date: string
}

export default defineEventHandler(async (event) => {
  const adminClient = await requireAdmin(event)

  const [inscriptions, prescripteurs, contacts, newsletter] = await Promise.all([
    adminClient.from('inscriptions')
      .select('created_at, jeunes(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(10),
    adminClient.from('prescripteurs')
      .select('created_at, name, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
    adminClient.from('contact_messages')
      .select('created_at, name, subject')
      .order('created_at', { ascending: false })
      .limit(10),
    adminClient.from('newsletter_subscribers')
      .select('subscribed_at, email')
      .order('subscribed_at', { ascending: false })
      .limit(10),
  ])

  const items: ActivityItem[] = []

  for (const row of inscriptions.data ?? []) {
    const jeuneData = row.jeunes as unknown
    const jeune = (Array.isArray(jeuneData) ? jeuneData[0] : jeuneData) as { first_name: string; last_name: string } | null
    items.push({
      type: 'inscription',
      label: 'Nouvelle inscription',
      detail: jeune ? `${jeune.first_name} ${jeune.last_name}` : 'Jeune inconnu',
      date: row.created_at,
    })
  }

  for (const row of prescripteurs.data ?? []) {
    items.push({
      type: 'prescripteur',
      label: 'Prescripteur en attente',
      detail: row.name,
      date: row.created_at,
    })
  }

  for (const row of contacts.data ?? []) {
    items.push({
      type: 'contact',
      label: 'Nouveau contact',
      detail: `${row.name} — ${row.subject}`,
      date: row.created_at,
    })
  }

  for (const row of newsletter.data ?? []) {
    items.push({
      type: 'newsletter',
      label: 'Nouvel abonne newsletter',
      detail: row.email,
      date: row.subscribed_at,
    })
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return items.slice(0, 10)
})
