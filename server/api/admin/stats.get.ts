import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const adminClient = await requireAdmin(event)

  const [prescripteurs, jeunes, inscriptions, pending, unreadContacts, newsletter] = await Promise.all([
    adminClient.from('prescripteurs').select('*', { count: 'exact', head: true }),
    adminClient.from('jeunes').select('*', { count: 'exact', head: true }),
    adminClient.from('inscriptions').select('*', { count: 'exact', head: true }),
    adminClient.from('prescripteurs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
    adminClient.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
  ])

  return {
    prescripteursCount: prescripteurs.count ?? 0,
    jeunesCount: jeunes.count ?? 0,
    inscriptionsCount: inscriptions.count ?? 0,
    pendingCount: pending.count ?? 0,
    unreadContactsCount: unreadContacts.count ?? 0,
    newsletterCount: newsletter.count ?? 0,
  }
})
