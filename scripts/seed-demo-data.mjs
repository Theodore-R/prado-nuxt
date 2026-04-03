/**
 * Seed script: populate the database with 1 year of realistic demo data.
 * Uses actual Supabase REST schema (not code-defined types).
 * Run: node scripts/seed-demo-data.mjs
 */

const SUPABASE_URL = 'https://vafbtwbsxdlefksonpyg.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZmJ0d2JzeGRsZWZrc29ucHlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI5MTIxNiwiZXhwIjoyMDg5ODY3MjE2fQ.jD6qCjsSzqV6Eq08YfeU9JNzuCEChawRhtfjtczKzxs'

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

async function sb(path, method = 'GET', body = null) {
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${method} ${path}: ${res.status} ${err}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}
function formatDate(d) { return d.toISOString().split('T')[0] }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// ─── Data pools ───

const PRENOMS_M = ['Lucas', 'Hugo', 'Nathan', 'Enzo', 'Louis', 'Adam', 'Ethan', 'Mathis', 'Noah', 'Liam', 'Raphaël', 'Arthur', 'Théo', 'Sacha', 'Maxime', 'Rayan', 'Yanis', 'Jules', 'Léo', 'Mohamed', 'Ibrahim', 'Amir', 'Sofiane', 'Bilal', 'Karim', 'Mehdi', 'Youssef', 'Omar', 'Malik', 'Djibril']
const PRENOMS_F = ['Emma', 'Jade', 'Léa', 'Chloé', 'Manon', 'Inès', 'Lina', 'Sarah', 'Camille', 'Anna', 'Zoé', 'Mia', 'Louise', 'Alice', 'Ambre', 'Aïcha', 'Fatima', 'Nadia', 'Samira', 'Yasmine', 'Kenza', 'Imane', 'Rania', 'Nour', 'Hafsa', 'Mariam', 'Clara', 'Rose', 'Eva', 'Lucie']
const NOMS = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'Andre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'Martinez', 'Benali', 'Bouchaib', 'Diallo', 'Traore', 'Camara', 'Ndiaye', 'Sy', 'Ba', 'Toure', 'Diop', 'Konate', 'Coulibaly']
const SITUATIONS = ['sans_emploi', 'scolarise_ordinaire', 'scolarise_medico_social', 'emploi_formation', 'autre']
const VILLES = [
  { cp: '69001', ville: 'Lyon 1er' }, { cp: '69002', ville: 'Lyon 2e' }, { cp: '69003', ville: 'Lyon 3e' },
  { cp: '69007', ville: 'Lyon 7e' }, { cp: '69008', ville: 'Lyon 8e' },
  { cp: '69100', ville: 'Villeurbanne' }, { cp: '69200', ville: 'Vénissieux' }, { cp: '69500', ville: 'Bron' },
]
const STRUCTURES = [
  'Mission Locale Lyon', 'Mission Locale Villeurbanne', 'Fondation du Prado',
  'MECS Les Cèdres', 'MECS Saint-Joseph', 'PJJ Lyon Centre', 'PJJ Vénissieux',
  'ASE Métropole de Lyon', 'Apprentis d\'Auteuil Lyon', 'Centre Social Mermoz',
  'Maison des Adolescents Lyon', 'Habitat et Humanisme',
]
const CONTACT_SUJETS = [
  'Demande d\'information sur les actions', 'Question sur l\'inscription', 'Partenariat possible',
  'Demande de brochure', 'Retour positif', 'Question sur le foodtruck', 'Demande d\'intervention',
  'Problème technique', 'Question facturation', 'Bénévolat',
]
const CONTACT_MESSAGES = [
  'Bonjour, je souhaiterais avoir plus d\'informations sur vos actions à destination des jeunes de notre structure.',
  'Pourriez-vous m\'indiquer comment inscrire un groupe de jeunes à votre prochaine action ?',
  'Nous sommes une association et aimerions discuter d\'un partenariat. Quand seriez-vous disponibles ?',
  'Bonjour, est-il possible de recevoir une brochure de présentation de vos programmes ?',
  'Je tenais à vous remercier pour l\'accompagnement lors du stage. Le jeune a beaucoup progressé !',
  'Nous aimerions organiser une session de la Fresque dans nos locaux. Est-ce possible ?',
  'Le bouton d\'inscription ne semble pas fonctionner. Pouvez-vous vérifier ?',
  'Quel est le coût de participation pour les actions de découverte professionnelle ?',
  'Je suis intéressée par du bénévolat au sein de votre fondation. Comment puis-je postuler ?',
  'Excellent programme ! Les jeunes que j\'accompagne ont adoré l\'atelier artistique.',
]

// Existing prescripteurs with auth users (can be used as owners)
const PRESCRIPTEUR_IDS = [
  '469815ed-7547-434f-a88c-c1e49e1a3cb2', // Théodore Riant (prescripteur)
  '5c229c6f-a14d-40c7-a656-12edb740bdac', // Théodore Riant (prescripteur)
  'bc9e6690-23be-474b-9f82-65341f6894c9', // Marie Dupont (prescripteur)
]

async function main() {
  console.log('🌱 Démarrage du peuplement...\n')

  // 1. Create 60 jeunes spread across the 3 prescripteurs
  console.log('🧒 Création de 60 jeunes...')
  const jeunesToInsert = []

  for (let i = 0; i < 60; i++) {
    const isMale = Math.random() > 0.5
    const prenom = isMale ? pick(PRENOMS_M) : pick(PRENOMS_F)
    const nom = pick(NOMS)
    const prescripteur = pick(PRESCRIPTEUR_IDS)
    const ville = pick(VILLES)

    jeunesToInsert.push({
      prescripteur_id: prescripteur,
      first_name: prenom,
      last_name: nom,
      date_of_birth: formatDate(randomDate(new Date('2003-01-01'), new Date('2008-12-31'))),
      situation: pick(SITUATIONS),
      address: `${Math.floor(1 + Math.random() * 99)} ${pick(['rue', 'avenue', 'boulevard', 'impasse', 'place'])} ${pick(['de la Paix', 'Victor Hugo', 'Jean Jaurès', 'Garibaldi', 'des Lilas', 'Pasteur', 'du Marché', 'Voltaire', 'Paul Bert', 'de la République'])}`,
      postal_code: ville.cp,
      city: ville.ville,
      notes: Math.random() > 0.7 ? pick([
        'Jeune motivé, bonne progression',
        'Suivi régulier, en recherche active',
        'Besoin d\'un accompagnement renforcé',
        'Très investi dans les ateliers',
        'Projet professionnel en construction',
      ]) : '',
      created_at: randomDate(new Date('2025-06-01'), new Date('2026-03-20')).toISOString(),
    })
  }

  try {
    const inserted = await sb('jeunes', 'POST', jeunesToInsert)
    console.log(`  ✅ ${inserted.length} jeunes créés`)
    var jeuneIds = inserted.map(j => ({ id: j.id, prescripteur_id: j.prescripteur_id }))
  } catch (e) {
    console.log(`  ⚠️ Jeunes: ${e.message}`)
    var jeuneIds = []
  }

  // 2. Get all actions
  console.log('\n📋 Récupération des actions...')
  const actions = await sb('actions?select=id,title,is_published&order=id')
  const publishedActions = actions.filter(a => a.is_published)
  console.log(`  📌 ${publishedActions.length} actions publiées sur ${actions.length} total`)

  // 3. Create inscriptions (each jeune gets 1-4 inscriptions, spread over the year)
  console.log('\n📝 Création d\'inscriptions...')
  const inscriptionsToInsert = []
  const usedPairs = new Set()

  for (const jeune of jeuneIds) {
    const numInsc = 1 + Math.floor(Math.random() * 4)
    for (let i = 0; i < numInsc; i++) {
      const action = pick(publishedActions)
      const pairKey = `${jeune.id}-${action.id}`
      if (usedPairs.has(pairKey)) continue
      usedPairs.add(pairKey)

      const inscDate = formatDate(randomDate(new Date('2025-07-01'), new Date('2026-04-15')))
      inscriptionsToInsert.push({
        prescripteur_id: jeune.prescripteur_id,
        jeune_id: jeune.id,
        action_id: String(action.id),
        date: inscDate,
        canceled_at: Math.random() > 0.92 ? randomDate(new Date('2025-08-01'), new Date('2026-03-30')).toISOString() : null,
        created_at: randomDate(new Date('2025-07-01'), new Date('2026-04-01')).toISOString(),
      })
    }
  }

  try {
    for (let i = 0; i < inscriptionsToInsert.length; i += 50) {
      const batch = inscriptionsToInsert.slice(i, i + 50)
      await sb('inscriptions', 'POST', batch)
    }
    console.log(`  ✅ ${inscriptionsToInsert.length} inscriptions créées`)
  } catch (e) {
    console.log(`  ⚠️ Inscriptions: ${e.message}`)
  }

  // 4. Create 25 contact messages
  console.log('\n📬 Création de messages de contact...')
  const sanitize = s => s.toLowerCase().replace(/\s/g, '.').replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a').replace(/[ùûü]/g, 'u').replace(/[ïî]/g, 'i').replace(/[ô]/g, 'o').replace(/'/g, '').replace(/[ç]/g, 'c')
  const contactsToInsert = []
  for (let i = 0; i < 25; i++) {
    const prenom = pick(PRENOMS_F.concat(PRENOMS_M))
    const nom = pick(NOMS)
    contactsToInsert.push({
      name: `${prenom} ${nom}`,
      email: `${sanitize(prenom)}.${sanitize(nom)}${i}@${pick(['gmail.com', 'outlook.fr', 'yahoo.fr'])}`,
      subject: pick(CONTACT_SUJETS),
      message: pick(CONTACT_MESSAGES),
      is_read: Math.random() > 0.4,
      created_at: randomDate(new Date('2025-06-01'), new Date('2026-04-02')).toISOString(),
    })
  }

  try {
    await sb('contact_messages', 'POST', contactsToInsert)
    console.log(`  ✅ ${contactsToInsert.length} messages de contact créés`)
  } catch (e) {
    console.log(`  ⚠️ Contacts: ${e.message}`)
  }

  // 5. Create newsletter subscribers
  console.log('\n📰 Création d\'abonnés newsletter...')
  const newsletterToInsert = []
  const emails = new Set()
  for (let i = 0; i < 40; i++) {
    const prenom = pick(PRENOMS_F.concat(PRENOMS_M))
    const nom = pick(NOMS)
    const email = `${sanitize(prenom)}.${sanitize(nom)}${i}@${pick(['gmail.com', 'outlook.fr', 'yahoo.fr', 'hotmail.com', 'protonmail.com'])}`
    if (emails.has(email)) continue
    emails.add(email)

    const subscribedAt = randomDate(new Date('2025-05-01'), new Date('2026-04-02'))
    const confirmed = Math.random() > 0.12
    newsletterToInsert.push({
      email,
      structure: Math.random() > 0.5 ? pick(STRUCTURES) : null,
      source: pick(['website', 'contact', 'footer', 'inscription']),
      confirmation_token: crypto.randomUUID(),
      confirmed_at: confirmed ? new Date(subscribedAt.getTime() + 3600000).toISOString() : null,
      subscribed_at: subscribedAt.toISOString(),
    })
  }

  try {
    await sb('newsletter_subscribers', 'POST', newsletterToInsert)
    console.log(`  ✅ ${newsletterToInsert.length} abonnés newsletter créés`)
  } catch (e) {
    console.log(`  ⚠️ Newsletter: ${e.message}`)
  }

  // 6. Update some actions with places_max and cost
  console.log('\n🎯 Mise à jour des actions (places, coûts)...')
  const updates = [
    { id: 6, places_max: 20, cost: 0 },
    { id: 7, places_max: 15, cost: 25 },
    { id: 8, places_max: 30, cost: 0 },
    { id: 9, places_max: 12, cost: 15 },
    { id: 10, places_max: 25, cost: 0 },
  ]
  let updCount = 0
  for (const u of updates) {
    try {
      await sb(`actions?id=eq.${u.id}`, 'PATCH', { places_max: u.places_max, cost: u.cost })
      updCount++
    } catch (e) { /* ignore if action doesn't exist */ }
  }
  console.log(`  ✅ ${updCount} actions mises à jour`)

  console.log(`
✨ Peuplement terminé !

  Résumé :
  - ${jeuneIds.length} jeunes créés
  - ${inscriptionsToInsert.length} inscriptions créées
  - ${contactsToInsert.length} messages de contact
  - ${newsletterToInsert.length} abonnés newsletter
  - ${updCount} actions avec places/coûts
  `)
}

main().catch(console.error)
