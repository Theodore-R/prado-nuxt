/**
 * Migration des pages statiques vers Prismic
 *
 * Usage : PRISMIC_WRITE_TOKEN=xxx node scripts/migrate-static-pages.mjs
 */

const REPO = 'prado-nuxt'
const TOKEN = process.env.PRISMIC_WRITE_TOKEN

if (!TOKEN) {
  console.error('PRISMIC_WRITE_TOKEN is required')
  process.exit(1)
}

const API_BASE = `https://migration.prismic.io`

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'x-api-key': TOKEN,
  'Content-Type': 'application/json',
  repository: REPO,
}

async function createDocument(doc) {
  const res = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(doc),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create ${doc.uid || doc.type}: ${res.status} ${text}`)
  }
  const data = await res.json()
  console.log(`  Created: ${doc.type} ${doc.uid || '(singleton)'} => ${data.id}`)
  return data
}

function richText(text) {
  return [{ type: 'paragraph', text, spans: [] }]
}

function heading2(text) {
  return { type: 'heading2', text, spans: [] }
}

function paragraph(text, spans = []) {
  return { type: 'paragraph', text, spans }
}

function listItem(text) {
  return { type: 'list-item', text, spans: [] }
}

// --- page_legale documents ---

const mentionsLegalesBody = [
  heading2('1. Editeur du site'),
  paragraph('Le site Prado Itineraires est edite par la Fondation du Prado.\nSiege social : 123 Rue de la Fondation, 69007 Lyon, France.\nTelephone : 04 72 XX XX XX\nEmail : itineraires@le-prado.fr', [
    { start: 8, end: 27, type: 'strong' },
    { start: 43, end: 63, type: 'strong' },
  ]),
  heading2('2. Directeur de la publication'),
  paragraph('Direction generale de la Fondation du Prado.'),
  heading2('3. Hebergement'),
  paragraph('Ce site est heberge par Vercel Inc.\n340 S Lemon Ave #4133 Walnut, CA 91789, USA.', [
    { start: 24, end: 34, type: 'strong' },
  ]),
  heading2('4. Propriete intellectuelle'),
  paragraph("L'ensemble de ce site releve de la legislation francaise et internationale sur le droit d'auteur et la propriete intellectuelle. Tous les droits de reproduction sont reserves."),
]

const politiqueConfidentialiteBody = [
  heading2('1. Collecte des donnees'),
  paragraph('Nous collectons les donnees suivantes :'),
  listItem('Informations d\'inscription (nom, email, structure) via nos formulaires.'),
  listItem('Donnees de navigation via des cookies analytiques (Microsoft Clarity).'),
  listItem('Messages envoyes via le formulaire de contact.'),
  heading2('2. Utilisation des donnees'),
  listItem('Gerer vos inscriptions aux actions et programmes.'),
  listItem('Vous envoyer notre newsletter (si vous y avez consenti).'),
  listItem('Repondre a vos demandes de contact.'),
  listItem("Ameliorer l'experience utilisateur sur notre site."),
  heading2('3. Conservation des donnees'),
  paragraph('Vos donnees personnelles sont conservees le temps necessaire a l\'accomplissement de l\'objectif poursuivi, dans le respect du RGPD.'),
  heading2('4. Vos droits'),
  paragraph('Conformement au RGPD, vous disposez d\'un droit d\'acces, de rectification, de suppression et de portabilite. Contact : itineraires@le-prado.fr.', [
    { start: 117, end: 143, type: 'hyperlink', data: { link_type: 'Web', url: 'mailto:itineraires@le-prado.fr' } },
  ]),
  heading2('5. Cookies et Tiers'),
  paragraph('Nous utilisons Supabase (donnees), Prismic (contenu) et Microsoft Clarity (analytics). Vous pouvez gerer vos preferences de cookies via le bandeau dedie.', [
    { start: 14, end: 22, type: 'strong' },
    { start: 34, end: 41, type: 'strong' },
    { start: 55, end: 72, type: 'strong' },
  ]),
]

// --- page documents (placeholders) ---

function placeholderBody(title) {
  return [paragraph(`Page en construction.`)]
}

// --- fresque singleton ---

const fresqueData = {
  surtitle: 'Atelier pedagogique et collaboratif',
  title: "La Fresque de la Protection de l'Enfance",
  description: "Decouvrir les acteurs, les parcours et les enjeux de la protection de l'enfance",
  brand_color: '#C18ED8',
  intro_title: 'Une experience immersive et collaborative',
  intro_body: [
    paragraph("Inspiree de la Fresque du climat, la Fresque de la Protection de l'Enfance met en scene les parcours de trois jeunes qui donnent a voir la complexite du systeme de protection de l'enfance et la diversite des dispositifs et metiers existants."),
    paragraph("Combinant jeu, echanges et reflexion commune, elle permet de mieux comprendre les parcours des enfants et la complexite du systeme qui les entoure. Pas a pas, la reconstitution esquisse une vision globale du systeme, que les participants s'approprient en relevant les liens entre les acteurs et les institutions."),
  ],
  testimonial_quote: [
    paragraph("C'est un outil pedagogique interessant pour eclairer les parcours de jeunes et rendre lisible la complexite du systeme de protection. Les scenarios sont bien construits et pertinents."),
  ],
  testimonial_author: 'Remi P., Chef de service en prevention specialisee',
  objectives: [
    { icon_name: 'BookOpen', label: 'Culture commune', desc: 'Entre professionnels et partenaires' },
    { icon_name: 'Lightbulb', label: "Pouvoir d'agir", desc: 'Reveler les vocations' },
    { icon_name: 'Shield', label: 'Un seul parti pris', desc: 'Les enfants sont vulnerables' },
  ],
  parcours: [
    { nom: 'Adele, 4 ans', desc: 'Situe le champ de la petite enfance', color: '#C18ED8' },
    { nom: 'Lucas, 13 ans', desc: 'Plonge dans les enjeux de la protection judiciaire de la jeunesse', color: '#FB6223' },
    { nom: 'Maelys, 17 ans', desc: "Situe les problematiques du passage a l'age adulte et des troubles psychosociaux", color: '#93C1AF' },
  ],
  sessions: [
    { date: '15 avril 2026', version: 'Pro & etudiants', lieu: 'Locaux Prado, Lyon 7e', duree: '3h00', places: '8/32' },
    { date: '22 mai 2026', version: 'Grand public', lieu: 'Mairie du 3e, Lyon', duree: '2h30', places: '4/8' },
    { date: '10 juin 2026', version: 'Pro & etudiants', lieu: 'Espace Confluence, Lyon 2e', duree: '3h00', places: '3/32' },
  ],
  meta_title: "La Fresque de la Protection de l'Enfance | Prado Itineraires",
  meta_description: "Decouvrir les acteurs, les parcours et les enjeux de la protection de l'enfance a travers un atelier collaboratif.",
}

// --- foodtruck singleton ---

const foodtruckData = {
  surtitle: 'Foodtruck solidaire',
  title: "Les Saveurs d'Elise",
  tagline: 'Apprendre & Regaler !',
  brand_color: '#FB6223',
  intro_title: 'Notre projet',
  intro_body: [
    paragraph("Concept pedagogique et inclusif, \"Les Saveurs d'Elise\" est une offre de restauration mobile qui favorise l'insertion socio-professionnelle des jeunes : accueillis en stage pendant une semaine dans la cuisine centrale et/ou en vente directe au public, les jeunes experimentent, rencontrent, se valorisent, tout en etant accompagnes par un educateur specialise."),
    paragraph("Notre menu, de saison et peu cher, est une invitation a la rencontre avec nos jeunes cuisiniers d'un jour et des distributions solidaires sont organisees en marge de l'activite principale."),
    paragraph("Ce projet inclusif et solidaire est co-porte par le territoire Rhone et Saone de Prado Education et Prado Itineraires."),
  ],
  highlights: [
    { icon_name: 'ChefHat', label: "Stage d'une semaine", desc: 'Cuisine & vente' },
    { icon_name: 'Users', label: 'Accompagnement', desc: 'Educateur specialise' },
    { icon_name: 'Heart', label: 'Solidaire', desc: 'Distributions gratuites' },
  ],
  tournee: [
    { jour: 'Mardi', lieu: 'Siege de Lyon Metropole Habitat (Lyon 3e)', precision: '1er mardi du mois' },
    { jour: 'Mardi', lieu: 'Green Campus Park (Venissieux)', precision: 'Les autres mardis' },
    { jour: 'Mercredi', lieu: 'Parc Neuville Industries', precision: 'En alternance' },
    { jour: 'Mercredi', lieu: "Les Cles de l'Atelier (La Mulatiere)", precision: '1er mercredi du mois' },
    { jour: 'Jeudi', lieu: 'Centre de Formation Simon Rousseau (Fontaines-sur-Saone)', precision: 'En alternance' },
    { jour: 'Jeudi', lieu: 'Centre de Formation Arfrips (Lyon Vaise)', precision: 'En alternance' },
    { jour: 'Jeudi', lieu: 'Direction Generale (Fontaines-Saint-Martin)', precision: 'En alternance' },
  ],
  plats: [
    { name: 'Choucroute traditionnelle', desc: 'Choucroute, pomme de terre, saucisse de Strasbourg, poitrine fumee, saucisse fumee et roti de porc' },
    { name: 'Choucroute de la mer', desc: 'Choucroute, pomme de terre, haddock, crevette, moule et filet de poisson (selon arrivage)' },
    { name: 'Choucroute vegetarienne', desc: 'Choucroute, pomme de terre, tofu fume, navet et courge rotis' },
  ],
  desserts: [
    { name: 'Salade de fruits de saison', desc: 'Jus de citron et fruits de saison' },
    { name: 'Strudel a la pomme', desc: 'Pate feuilletee, pomme, raisins secs, cannelle, sucre glace, amandes' },
  ],
  steps: [
    { step_number: '01', title: 'Le prescripteur nous contacte', desc: "Par telephone ou via le formulaire de contact pour convenir d'une semaine de stage.", color: '#FB6223' },
    { step_number: '02', title: 'Validation et preparation', desc: 'Un entretien est organise avec le jeune et son referent pour preparer le stage.', color: '#CF006C' },
    { step_number: '03', title: 'Semaine de stage', desc: "Le jeune integre l'equipe pendant une semaine : cuisine, vente, relation client.", color: '#93C1AF' },
  ],
  meta_title: "Les Saveurs d'Elise - Foodtruck solidaire | Prado Itineraires",
  meta_description: "Foodtruck solidaire du Prado : stage d'insertion, menu de saison a prix solidaire, et tournee hebdomadaire.",
}

// --- educolab singleton ---

const educolabData = {
  surtitle: 'Competences parentales',
  title: 'Educolab',
  brand_color: '#93C1AF',
  card_title: 'Programmes educatifs',
  card_body: [
    paragraph("Educolab regroupe les programmes de renforcement des competences parentales, a destination des familles et professionnels de l'education et de la petite enfance."),
    paragraph("Ce volet dispose de son propre site internet avec toutes les informations sur les programmes, formations et ressources."),
  ],
  cta_label: 'Visiter le site Educolab',
  cta_link: { link_type: 'Web', url: 'https://educolab.le-prado.fr', target: '_blank' },
  meta_title: 'Educolab | Prado Itineraires',
  meta_description: "Programmes de renforcement des competences parentales par le Prado.",
}

// ---

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
  console.log('=== Migration des pages statiques vers Prismic ===\n')

  // 1. Pages legales
  console.log('1. Pages legales')
  await createDocument({
    title: 'Mentions Legales',
    type: 'page_legale',
    uid: 'mentions-legales',
    lang: 'en-us',
    data: {
      title: 'Mentions Legales',
      body: mentionsLegalesBody,
      meta_title: 'Mentions legales | Prado Itineraires',
    },
  })
  await delay(1000)

  await createDocument({
    title: 'Politique de Confidentialite',
    type: 'page_legale',
    uid: 'politique-confidentialite',
    lang: 'en-us',
    data: {
      title: 'Politique de Confidentialite',
      body: politiqueConfidentialiteBody,
      meta_title: 'Politique de confidentialite | Prado Itineraires',
    },
  })
  await delay(1000)

  // 2. Pages generiques (placeholders)
  console.log('\n2. Pages generiques')
  const pages = [
    { uid: 'organisation', title: 'Notre organisation' },
    { uid: 'impact-social', title: "Mesure d'impact social" },
    { uid: 'pratiques-inspirantes', title: 'Recueil des pratiques inspirantes' },
    { uid: 'rapport-activite', title: "Rapport d'activite 2024" },
  ]
  for (const p of pages) {
    await createDocument({
      title: p.title,
      type: 'page',
      uid: p.uid,
      lang: 'en-us',
      data: {
        title: p.title,
        body: placeholderBody(p.title),
        meta_title: `${p.title} | Prado Itineraires`,
      },
    })
    await delay(1000)
  }

  // 3. Fresque singleton
  console.log('\n3. Fresque (singleton)')
  await createDocument({
    title: fresqueData.title,
    type: 'fresque',
    lang: 'en-us',
    data: fresqueData,
  })
  await delay(1000)

  // 4. Foodtruck singleton
  console.log('\n4. Foodtruck (singleton)')
  await createDocument({
    title: foodtruckData.title,
    type: 'foodtruck',
    lang: 'en-us',
    data: foodtruckData,
  })
  await delay(1000)

  // 5. Educolab singleton
  console.log('\n5. Educolab (singleton)')
  await createDocument({
    title: educolabData.title,
    type: 'educolab',
    lang: 'en-us',
    data: educolabData,
  })

  console.log('\n=== Migration terminee ! ===')
  console.log('Les documents sont en brouillon dans Prismic.')
  console.log('Connectez-vous a prismic.io pour les relire et publier.')
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
