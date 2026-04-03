/**
 * E2E test data seeding via Supabase service role key.
 * All test data uses 'e2e-test-' prefix for safe cleanup.
 */
import { adminClient } from './supabase-admin'

// ─── Constants ───

const TEST_PASSWORD = 'TestPass123!'

export const TEST_USERS = {
  admin: {
    email: 'e2e-test-admin@prado-test.fr',
    password: TEST_PASSWORD,
    name: 'Admin Test',
    role: 'admin' as const,
    status: 'approved' as const,
  },
  prescripteurApproved: {
    email: 'e2e-test-prescripteur@prado-test.fr',
    password: TEST_PASSWORD,
    name: 'Prescripteur Approuve',
    role: 'prescripteur' as const,
    status: 'approved' as const,
  },
  prescripteurPending: {
    email: 'e2e-test-pending@prado-test.fr',
    password: TEST_PASSWORD,
    name: 'Prescripteur EnAttente',
    role: 'prescripteur' as const,
    status: 'pending' as const,
  },
  prescripteurBeta: {
    email: 'e2e-test-beta@prado-test.fr',
    password: TEST_PASSWORD,
    name: 'Prescripteur Beta',
    role: 'prescripteur' as const,
    status: 'approved' as const,
  },
}

// IDs stored after seeding
export const seedIds = {
  structures: { alpha: '', beta: '', empty: '' },
  users: { admin: '', approved: '', pending: '', beta: '' },
  jeunes: [] as string[],
  actions: { published: 0, full: 0, recurring: 0, unpublished: 0, archived: 0 },
  actionDates: [] as string[],
  inscriptions: [] as string[],
  etablissements: [] as string[],
}

// ─── Seed Functions ───

export async function seedStructures() {
  const structures = [
    { name: 'E2E Structure Alpha', is_prado: true, type: 'Association', postal_code: '13001', city: 'Marseille' },
    { name: 'E2E Structure Beta', is_prado: false, type: 'Mission locale', postal_code: '13002', city: 'Marseille' },
    { name: 'E2E Structure Vide', is_prado: false, type: 'Autre', postal_code: '13003', city: 'Marseille' },
  ]

  const { data, error } = await adminClient
    .from('structures')
    .upsert(structures, { onConflict: 'name' })
    .select('id, name')

  if (error) throw new Error(`Seed structures failed: ${error.message}`)

  seedIds.structures.alpha = data!.find(s => s.name === 'E2E Structure Alpha')!.id
  seedIds.structures.beta = data!.find(s => s.name === 'E2E Structure Beta')!.id
  seedIds.structures.empty = data!.find(s => s.name === 'E2E Structure Vide')!.id

  return data
}

export async function seedUsers() {
  const users = Object.entries(TEST_USERS)
  const userMap: Record<string, string> = {}

  for (const [key, u] of users) {
    // Check if user already exists
    const { data: existing } = await adminClient.auth.admin.listUsers()
    const existingUser = existing?.users?.find(eu => eu.email === u.email)

    let userId: string
    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name },
      })
      if (error) throw new Error(`Seed user ${u.email} failed: ${error.message}`)
      userId = data.user.id
    }

    userMap[key] = userId
  }

  seedIds.users.admin = userMap.admin
  seedIds.users.approved = userMap.prescripteurApproved
  seedIds.users.pending = userMap.prescripteurPending
  seedIds.users.beta = userMap.prescripteurBeta

  return userMap
}

export async function seedPrescripteurs() {
  const prescripteurs = [
    {
      id: seedIds.users.admin,
      name: TEST_USERS.admin.name,
      professional_email: TEST_USERS.admin.email,
      structure: 'E2E Structure Alpha',
      structure_id: seedIds.structures.alpha,
      role: 'admin',
      status: 'approved',
    },
    {
      id: seedIds.users.approved,
      name: TEST_USERS.prescripteurApproved.name,
      professional_email: TEST_USERS.prescripteurApproved.email,
      structure: 'E2E Structure Alpha',
      structure_id: seedIds.structures.alpha,
      role: 'prescripteur',
      status: 'approved',
    },
    {
      id: seedIds.users.pending,
      name: TEST_USERS.prescripteurPending.name,
      professional_email: TEST_USERS.prescripteurPending.email,
      structure: 'E2E Structure Alpha',
      structure_id: seedIds.structures.alpha,
      role: 'prescripteur',
      status: 'pending',
    },
    {
      id: seedIds.users.beta,
      name: TEST_USERS.prescripteurBeta.name,
      professional_email: TEST_USERS.prescripteurBeta.email,
      structure: 'E2E Structure Beta',
      structure_id: seedIds.structures.beta,
      role: 'prescripteur',
      status: 'approved',
    },
  ]

  const { error } = await adminClient
    .from('prescripteurs')
    .upsert(prescripteurs, { onConflict: 'id' })

  if (error) throw new Error(`Seed prescripteurs failed: ${error.message}`)
}

export async function seedJeunes() {
  const jeunes = [
    { prescripteur_id: seedIds.users.approved, structure_id: seedIds.structures.alpha, first_name: 'Jean', last_name: 'Test', date_of_birth: '2005-03-15', situation: 'sans_emploi', sex: 'homme', is_qpv: true, accompagnement_type: ['ASE'], notes: '' },
    { prescripteur_id: seedIds.users.approved, structure_id: seedIds.structures.alpha, first_name: 'Marie', last_name: 'Test', date_of_birth: '2004-07-22', situation: 'scolarise_ordinaire', sex: 'femme', is_qpv: false, accompagnement_type: [], notes: 'Note de test' },
    { prescripteur_id: seedIds.users.approved, structure_id: seedIds.structures.alpha, first_name: 'Lucas', last_name: 'Test', date_of_birth: '2006-01-10', situation: 'emploi_formation', sex: 'homme', is_qpv: false, accompagnement_type: ['PJJ'], notes: '' },
    { prescripteur_id: seedIds.users.approved, structure_id: seedIds.structures.alpha, first_name: 'Emma', last_name: 'Test', date_of_birth: '2005-11-05', situation: 'autre', sex: 'femme', is_qpv: true, accompagnement_type: ['ASE', 'PJJ'], notes: '' },
    { prescripteur_id: seedIds.users.beta, structure_id: seedIds.structures.beta, first_name: 'Pierre', last_name: 'Beta', date_of_birth: '2005-05-20', situation: 'sans_emploi', sex: 'homme', is_qpv: false, accompagnement_type: [], notes: '' },
    { prescripteur_id: seedIds.users.beta, structure_id: seedIds.structures.beta, first_name: 'Sophie', last_name: 'Beta', date_of_birth: '2004-09-12', situation: 'scolarise_ordinaire', sex: 'femme', is_qpv: false, accompagnement_type: [], notes: '' },
  ]

  const { data, error } = await adminClient
    .from('jeunes')
    .insert(jeunes)
    .select('id')

  if (error) throw new Error(`Seed jeunes failed: ${error.message}`)

  seedIds.jeunes = data!.map(j => j.id)
  return data
}

export async function seedEtablissements() {
  const etabs = [
    { name: 'E2E Etablissement 1', address: '1 rue Test', postal_code: '13001', city: 'Marseille' },
    { name: 'E2E Etablissement 2', address: '2 rue Test', postal_code: '13002', city: 'Marseille' },
  ]

  const { data, error } = await adminClient
    .from('etablissements')
    .insert(etabs)
    .select('id')

  if (error) throw new Error(`Seed etablissements failed: ${error.message}`)

  seedIds.etablissements = data!.map(e => e.id)
  return data
}

export async function seedActions() {
  const today = new Date()
  const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const pastDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const actions = [
    { title: 'E2E Action Publiee', category: 'Sport', summary: 'Action de test publiee', description: 'Description test', is_activite: true, is_published: true, places_max: 10, date: futureDate.toISOString().split('T')[0], time: '14:00' },
    { title: 'E2E Action Complete', category: 'Culture', summary: 'Action complete', description: 'Description complete', is_activite: true, is_published: true, places_max: 1, date: futureDate.toISOString().split('T')[0], time: '10:00' },
    { title: 'E2E Action Recurrente', category: 'Emploi', summary: 'Action recurrente', description: 'Description recurrente', is_activite: true, is_published: true, is_recurring: true, places_max: null, date: futureDate.toISOString().split('T')[0], time: '09:00' },
    { title: 'E2E Action Non Publiee', category: 'Sante', summary: 'Non publiee', description: 'Non publiee', is_activite: true, is_published: false, places_max: 5 },
    { title: 'E2E Action Archivee', category: 'Sport', summary: 'Archivee', description: 'Archivee', is_activite: true, is_published: true, places_max: 20, archived_at: pastDate.toISOString() },
  ]

  const { data, error } = await adminClient
    .from('actions')
    .insert(actions)
    .select('id, title')

  if (error) throw new Error(`Seed actions failed: ${error.message}`)

  seedIds.actions.published = data!.find(a => a.title === 'E2E Action Publiee')!.id
  seedIds.actions.full = data!.find(a => a.title === 'E2E Action Complete')!.id
  seedIds.actions.recurring = data!.find(a => a.title === 'E2E Action Recurrente')!.id
  seedIds.actions.unpublished = data!.find(a => a.title === 'E2E Action Non Publiee')!.id
  seedIds.actions.archived = data!.find(a => a.title === 'E2E Action Archivee')!.id

  return data
}

export async function seedActionDates() {
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const dates = [
    { action_id: seedIds.actions.published, date: futureDate.toISOString().split('T')[0], time: '14:00', places_max: 10 },
    { action_id: seedIds.actions.full, date: futureDate.toISOString().split('T')[0], time: '10:00', places_max: 1 },
    { action_id: seedIds.actions.recurring, date: futureDate.toISOString().split('T')[0], time: '09:00', places_max: null },
    { action_id: seedIds.actions.recurring, date: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '09:00', places_max: null },
    { action_id: seedIds.actions.recurring, date: new Date(futureDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '09:00', places_max: null },
  ]

  const { data, error } = await adminClient
    .from('action_dates')
    .insert(dates)
    .select('id')

  if (error) throw new Error(`Seed action_dates failed: ${error.message}`)

  seedIds.actionDates = data!.map(d => d.id)
  return data
}

export async function seedInscriptions() {
  const inscriptions = [
    { prescripteur_id: seedIds.users.approved, jeune_id: seedIds.jeunes[0], action_id: seedIds.actions.published, action_date_id: seedIds.actionDates[0], presence: 'inscrit' },
    { prescripteur_id: seedIds.users.approved, jeune_id: seedIds.jeunes[1], action_id: seedIds.actions.published, action_date_id: seedIds.actionDates[0], presence: 'inscrit' },
    { prescripteur_id: seedIds.users.beta, jeune_id: seedIds.jeunes[4], action_id: seedIds.actions.full, action_date_id: seedIds.actionDates[1], presence: 'inscrit' },
  ]

  const { data, error } = await adminClient
    .from('inscriptions')
    .insert(inscriptions)
    .select('id')

  if (error) throw new Error(`Seed inscriptions failed: ${error.message}`)

  seedIds.inscriptions = data!.map(i => i.id)
  return data
}

export async function seedContactMessages() {
  const messages = [
    { name: 'E2E Contact 1', email: 'e2e-contact1@test.fr', subject: 'Test sujet 1', message: 'Message de test 1', is_read: false },
    { name: 'E2E Contact 2', email: 'e2e-contact2@test.fr', subject: 'Test sujet 2', message: 'Message de test 2', is_read: false },
    { name: 'E2E Contact 3', email: 'e2e-contact3@test.fr', subject: 'Test sujet 3', message: 'Message de test lu', is_read: true },
  ]

  const { error } = await adminClient
    .from('contact_messages')
    .insert(messages)

  if (error) throw new Error(`Seed contact_messages failed: ${error.message}`)
}

export async function seedNewsletterSubscribers() {
  const subscribers = [
    { email: 'e2e-newsletter1@test.fr', structure: 'E2E Structure Alpha', source: 'website', confirmed_at: new Date().toISOString() },
    { email: 'e2e-newsletter2@test.fr', structure: null, source: 'contact', confirmed_at: new Date().toISOString() },
    { email: 'e2e-newsletter3@test.fr', structure: 'E2E Structure Beta', source: 'website', confirmed_at: null },
  ]

  const { error } = await adminClient
    .from('newsletter_subscribers')
    .upsert(subscribers, { onConflict: 'email' })

  if (error) throw new Error(`Seed newsletter_subscribers failed: ${error.message}`)
}

// ─── Main seed ───

export async function seedAll() {
  console.log('[E2E Seed] Starting...')
  await seedStructures()
  console.log('[E2E Seed] Structures OK')
  await seedUsers()
  console.log('[E2E Seed] Users OK')
  await seedPrescripteurs()
  console.log('[E2E Seed] Prescripteurs OK')
  await seedEtablissements()
  console.log('[E2E Seed] Etablissements OK')
  await seedActions()
  console.log('[E2E Seed] Actions OK')
  await seedActionDates()
  console.log('[E2E Seed] Action dates OK')
  await seedJeunes()
  console.log('[E2E Seed] Jeunes OK')
  await seedInscriptions()
  console.log('[E2E Seed] Inscriptions OK')
  await seedContactMessages()
  console.log('[E2E Seed] Contact messages OK')
  await seedNewsletterSubscribers()
  console.log('[E2E Seed] Newsletter subscribers OK')
  console.log('[E2E Seed] All done!')
}

// ─── Cleanup ───

export async function cleanupAll() {
  console.log('[E2E Cleanup] Starting...')

  // Delete in reverse dependency order
  await adminClient.from('inscriptions').delete().in('prescripteur_id', [seedIds.users.approved, seedIds.users.beta, seedIds.users.pending])
  await adminClient.from('jeunes').delete().in('structure_id', [seedIds.structures.alpha, seedIds.structures.beta])
  await adminClient.from('action_dates').delete().in('action_id', [seedIds.actions.published, seedIds.actions.full, seedIds.actions.recurring, seedIds.actions.unpublished, seedIds.actions.archived])
  await adminClient.from('actions').delete().like('title', 'E2E %')
  await adminClient.from('newsletter_subscribers').delete().like('email', 'e2e-%')
  await adminClient.from('contact_messages').delete().like('email', 'e2e-%')
  await adminClient.from('prescripteurs').delete().in('id', [seedIds.users.admin, seedIds.users.approved, seedIds.users.pending, seedIds.users.beta])
  await adminClient.from('etablissements').delete().like('name', 'E2E %')
  await adminClient.from('structures').delete().like('name', 'E2E %')

  // Delete auth users
  for (const userId of Object.values(seedIds.users)) {
    if (userId) {
      await adminClient.auth.admin.deleteUser(userId).catch(() => {})
    }
  }

  console.log('[E2E Cleanup] Done!')
}
