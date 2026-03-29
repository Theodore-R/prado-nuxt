import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'
import { toJeuneSante } from '~/lib/types/sante'

// ─── Validation helpers ───

function assertArray(val: unknown, field: string): unknown[] {
  if (!Array.isArray(val)) throw createError({ statusCode: 400, message: `${field} doit être un tableau` })
  return val
}

function assertStringArray(val: unknown, field: string, maxLen = 200): string[] {
  const arr = assertArray(val, field)
  for (const item of arr) {
    if (typeof item !== 'string') throw createError({ statusCode: 400, message: `${field} contient une valeur non-texte` })
    if (item.length > maxLen) throw createError({ statusCode: 400, message: `${field}: valeur trop longue (max ${maxLen})` })
  }
  return arr as string[]
}

function assertString(val: unknown, field: string, maxLen = 1000): string {
  if (val == null) return ''
  if (typeof val !== 'string') throw createError({ statusCode: 400, message: `${field} doit être du texte` })
  if (val.length > maxLen) throw createError({ statusCode: 400, message: `${field}: trop long (max ${maxLen})` })
  return val
}

function validateTauxInvalidite(val: string): string {
  if (!val) return ''
  // Format: "non_concerne" | "en_cours" | "renouvellement" | "reconnu:XX"
  const validStatuts = ['non_concerne', 'en_cours', 'renouvellement']
  if (validStatuts.includes(val)) return val
  if (val.startsWith('reconnu:')) {
    const taux = parseInt(val.split(':')[1])
    if (isNaN(taux) || taux < 0 || taux > 100) {
      throw createError({ statusCode: 400, message: 'Taux d\'invalidité doit être entre 0 et 100' })
    }
    return val
  }
  // Legacy plain text — accept as-is
  return val
}

const PHONE_REGEX = /^[\d\s+()./-]*$/

function validatePhone(val: string, field: string): string {
  if (!val) return ''
  if (!PHONE_REGEX.test(val)) {
    throw createError({ statusCode: 400, message: `${field}: format de téléphone invalide` })
  }
  return val
}

function validateContactsUrgence(val: unknown): unknown[] {
  const arr = assertArray(val, 'contactsUrgence')
  for (const c of arr) {
    if (!c || typeof c !== 'object') throw createError({ statusCode: 400, message: 'Contact d\'urgence invalide' })
    const contact = c as Record<string, unknown>
    assertString(contact.nom, 'contact.nom', 200)
    if (contact.telephone) validatePhone(String(contact.telephone), 'contact.telephone')
    assertString(contact.lien, 'contact.lien', 50)
  }
  return arr
}

function validateSuiviMedical(val: unknown): unknown[] {
  const arr = assertArray(val, 'suiviMedical')
  for (const s of arr) {
    if (!s || typeof s !== 'object') throw createError({ statusCode: 400, message: 'Entrée de suivi médical invalide' })
    const suivi = s as Record<string, unknown>
    assertString(suivi.specialite, 'suivi.specialite', 100)
    assertString(suivi.frequence, 'suivi.frequence', 50)
    assertString(suivi.details, 'suivi.details', 500)
  }
  return arr
}

function validateSuiviPsy(val: unknown): Record<string, unknown> {
  if (!val || typeof val !== 'object' || Array.isArray(val)) {
    return { enCours: false, type: '', frequence: '', notes: '' }
  }
  const psy = val as Record<string, unknown>
  return {
    enCours: !!psy.enCours,
    type: assertString(psy.type, 'suiviPsy.type', 100),
    frequence: assertString(psy.frequence, 'suiviPsy.frequence', 50),
    notes: assertString(psy.notes, 'suiviPsy.notes', 2000),
  }
}

function validateMedecin(val: unknown): Record<string, unknown> {
  if (!val || typeof val !== 'object' || Array.isArray(val)) {
    return { nom: '', telephone: '', adresse: '', codePostal: '', specialite: '' }
  }
  const m = val as Record<string, unknown>
  return {
    nom: assertString(m.nom, 'medecin.nom', 200),
    telephone: m.telephone ? validatePhone(String(m.telephone), 'medecin.telephone') : '',
    adresse: assertString(m.adresse, 'medecin.adresse', 500),
    codePostal: assertString(m.codePostal, 'medecin.codePostal', 10),
    specialite: assertString(m.specialite, 'medecin.specialite', 200),
  }
}

function validateReferent(val: unknown): Record<string, unknown> {
  if (!val || typeof val !== 'object' || Array.isArray(val)) {
    return { nom: '', fonction: '', telephone: '', email: '' }
  }
  const r = val as Record<string, unknown>
  const email = assertString(r.email, 'referent.email', 200)
  if (email && !email.includes('@')) {
    throw createError({ statusCode: 400, message: 'referent.email: format email invalide' })
  }
  return {
    nom: assertString(r.nom, 'referent.nom', 200),
    fonction: assertString(r.fonction, 'referent.fonction', 100),
    telephone: r.telephone ? validatePhone(String(r.telephone), 'referent.telephone') : '',
    email,
  }
}

function validateCompositionFamiliale(val: unknown): unknown[] {
  const arr = assertArray(val, 'compositionFamiliale')
  for (const m of arr) {
    if (!m || typeof m !== 'object') throw createError({ statusCode: 400, message: 'Membre familial invalide' })
    const membre = m as Record<string, unknown>
    assertString(membre.lien, 'membre.lien', 50)
    assertString(membre.prenom, 'membre.prenom', 100)
    assertString(String(membre.age ?? ''), 'membre.age', 10)
  }
  return arr
}

// ─── Handler ───

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const jeuneId = getRouterParam(event, 'id')
  if (!jeuneId) throw createError({ statusCode: 400, message: 'id requis' })

  const body = await readBody(event)
  if (!body) throw createError({ statusCode: 400, message: 'Corps de requête vide' })

  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  // Verify ownership (by structure or admin)
  const { data: jeune } = await supabase
    .from('jeunes')
    .select('prescripteur_id, structure_id')
    .eq('id', jeuneId)
    .single()

  if (!jeune) throw createError({ statusCode: 404, message: 'Jeune introuvable' })

  const { data: prescripteur } = await supabase
    .from('prescripteurs')
    .select('role, structure_id')
    .eq('id', user.id)
    .single()

  const sameStructure = prescripteur?.structure_id && jeune.structure_id && prescripteur.structure_id === jeune.structure_id
  if (!sameStructure && prescripteur?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  // Validate all fields
  const allergies = assertStringArray(body.allergies ?? [], 'allergies')
  const handicap = assertString(body.handicap, 'handicap', 100)
  const tauxInvalidite = validateTauxInvalidite(assertString(body.tauxInvalidite, 'tauxInvalidite', 50))
  const suiviPsy = validateSuiviPsy(body.suiviPsychologique)
  const suiviMed = validateSuiviMedical(body.suiviMedical ?? [])
  const traitements = assertStringArray(body.traitementsEnCours ?? [], 'traitementsEnCours')
  const regimes = assertStringArray(body.regimeAlimentaire ?? [], 'regimeAlimentaire', 50)
  const contacts = validateContactsUrgence(body.contactsUrgence ?? [])
  const medecin = validateMedecin(body.medecinTraitant)
  const mesures = assertStringArray(body.mesureProtection ?? [], 'mesureProtection', 50)
  const referent = validateReferent(body.referentAse)
  const compoFamiliale = validateCompositionFamiliale(body.compositionFamiliale ?? [])
  const lieuHebergement = assertString(body.lieuHebergement, 'lieuHebergement', 100)
  const droitsParentaux = assertString(body.droitsParentaux, 'droitsParentaux', 500)
  const notesConfidentielles = assertString(body.notesConfidentielles, 'notesConfidentielles', 5000)

  const row = {
    jeune_id: jeuneId,
    allergies,
    handicap,
    taux_invalidite: tauxInvalidite,
    suivi_psychologique: suiviPsy,
    suivi_medical: suiviMed,
    traitements_en_cours: traitements,
    regime_alimentaire: regimes,
    contacts_urgence: contacts,
    medecin_traitant: medecin,
    mesure_protection: mesures,
    referent_ase: referent,
    composition_familiale: compoFamiliale,
    lieu_hebergement: lieuHebergement,
    droits_parentaux: droitsParentaux,
    notes_confidentielles: notesConfidentielles,
    derniere_mise_a_jour: new Date().toISOString(),
    mis_a_jour_par: user.id,
  }

  // Upsert: insert or update on conflict (jeune_id is UNIQUE)
  const { data, error } = await supabase
    .from('jeune_sante')
    .upsert(row, { onConflict: 'jeune_id' })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return toJeuneSante(data)
})
