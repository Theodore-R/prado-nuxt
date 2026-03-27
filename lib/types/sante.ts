// ─── Types pour les donnees de sante & situation familiale ───
// Stockees sur la base HDS (Scalingo), separees des donnees Supabase.

export interface ContactUrgence {
  nom: string
  telephone: string
  lien: string // pere, mere, tuteur, educateur, autre
}

export interface ReferentAse {
  nom: string
  fonction: string
  telephone: string
  email: string
}

export interface SuiviMedicalEntry {
  specialite: string
  frequence: string
  details: string
}

export interface SuiviPsychologique {
  enCours: boolean
  type: string
  frequence: string
  notes: string
}

export interface MedecinTraitant {
  nom: string
  telephone: string
  adresse: string
  codePostal: string
  specialite: string
}

export interface MembreFamille {
  lien: string
  prenom: string
  age: string
  vitAvec: boolean
}

export interface JeuneSante {
  id: string
  jeuneId: string
  // Sante
  allergies: string[]
  handicap: string
  tauxInvalidite: string
  suiviPsychologique: SuiviPsychologique
  suiviMedical: SuiviMedicalEntry[]
  traitementsEnCours: string[]
  regimeAlimentaire: string[]
  contactsUrgence: ContactUrgence[]
  medecinTraitant: MedecinTraitant
  // Situation familiale
  mesureProtection: string[]
  referentAse: ReferentAse
  compositionFamiliale: MembreFamille[]
  lieuHebergement: string
  droitsParentaux: string
  // Meta
  notesConfidentielles: string
  derniereMiseAJour: string
  misAJourPar: string
}

export type JeuneSanteInput = Omit<JeuneSante, 'id' | 'jeuneId' | 'derniereMiseAJour' | 'misAJourPar'>

// ─── Constantes pour les selects ───

export const SITUATIONS = [
  { value: '', label: 'Non renseigné' },
  { value: 'scolarise', label: 'Scolarisé(e)' },
  { value: 'decrochage', label: 'Décrochage scolaire' },
  { value: 'formation', label: 'En formation' },
  { value: 'emploi', label: 'En emploi' },
  { value: 'recherche-emploi', label: 'En recherche d\'emploi' },
  { value: 'service-civique', label: 'Service civique' },
  { value: 'neet', label: 'NEET (ni emploi, ni formation)' },
  { value: 'apprentissage', label: 'En apprentissage' },
  { value: 'autre', label: 'Autre' },
] as const

export const TYPES_HANDICAP = [
  { value: '', label: 'Non renseigné' },
  { value: 'aucun', label: 'Aucun handicap reconnu' },
  { value: 'moteur', label: 'Handicap moteur' },
  { value: 'visuel', label: 'Handicap visuel' },
  { value: 'auditif', label: 'Handicap auditif' },
  { value: 'mental', label: 'Handicap mental / intellectuel' },
  { value: 'psychique', label: 'Handicap psychique' },
  { value: 'tsa', label: 'Troubles du spectre autistique (TSA)' },
  { value: 'cognitif', label: 'Troubles cognitifs (DYS, TDAH)' },
  { value: 'polyhandicap', label: 'Polyhandicap' },
  { value: 'maladie-invalidante', label: 'Maladie invalidante' },
  { value: 'autre', label: 'Autre' },
] as const

export const DROITS_PARENTAUX_OPTIONS = [
  { value: '', label: 'Non renseigné' },
  { value: 'exercice-commun', label: 'Autorité parentale conjointe' },
  { value: 'exercice-exclusif', label: 'Autorité parentale exclusive (un parent)' },
  { value: 'retrait-partiel', label: 'Retrait partiel de l\'autorité parentale' },
  { value: 'retrait-total', label: 'Retrait total de l\'autorité parentale' },
  { value: 'delegation', label: 'Délégation d\'autorité parentale' },
  { value: 'tutelle', label: 'Tutelle (pupille)' },
  { value: 'mna', label: 'Mineur non accompagné (MNA)' },
  { value: 'autre', label: 'Autre' },
] as const

export const ALLERGENES_COURANTS = [
  // Alimentaires
  'Arachides', 'Fruits à coque', 'Gluten', 'Lactose', 'Lait de vache',
  'Oeufs', 'Poisson', 'Crustacés', 'Soja', 'Sésame', 'Céleri',
  'Moutarde', 'Lupin', 'Mollusques', 'Sulfites',
  // Médicamenteuses
  'Pénicilline', 'Amoxicilline', 'Aspirine', 'Ibuprofène', 'Paracétamol',
  'Sulfamides', 'Codéine', 'Latex',
  // Environnementales
  'Acariens', 'Pollen de graminées', 'Pollen de bouleau', 'Poils de chat',
  'Poils de chien', 'Moisissures', 'Venin d\'abeille', 'Venin de guêpe',
  'Nickel',
] as const

export const MEDICAMENTS_COURANTS = [
  // Psychotropes / neurologie (les plus prescrits chez les jeunes)
  'Ritaline (méthylphénidate)', 'Concerta (méthylphénidate LP)', 'Quasym',
  'Strattera (atomoxétine)', 'Risperdal (rispéridone)', 'Abilify (aripiprazole)',
  'Séroquel (quétiapine)', 'Zyprexa (olanzapine)',
  'Prozac (fluoxétine)', 'Zoloft (sertraline)', 'Deroxat (paroxétine)',
  'Effexor (venlafaxine)', 'Cymbalta (duloxétine)',
  'Xanax (alprazolam)', 'Lexomil (bromazépam)', 'Lysanxia (prazépam)',
  'Tercian (cyamémazine)', 'Atarax (hydroxyzine)',
  'Dépakine (valproate)', 'Tégrétol (carbamazépine)', 'Lamictal (lamotrigine)',
  'Keppra (lévétiracétam)',
  // Courants
  'Doliprane (paracétamol)', 'Ibuprofène', 'Spasfon',
  'Ventoline (salbutamol)', 'Flixotide (fluticasone)',
  'Lévothyrox (lévothyroxine)', 'Mélatonine',
  // Contraception
  'Pilule contraceptive', 'Implant contraceptif',
] as const

export const MESURES_PROTECTION = [
  { value: 'aucune', label: 'Aucune mesure' },
  // Mesures administratives (Conseil départemental / ASE)
  { value: 'aed', label: 'AED (Aide Éducative à Domicile)' },
  { value: 'accueil-provisoire', label: 'Accueil provisoire (ASE)' },
  { value: 'contrat-jeune-majeur', label: 'Contrat jeune majeur' },
  { value: 'apc', label: 'APC (Accueil Provisoire de l\'enfant Confié)' },
  { value: 'ip', label: 'IP (Information Préoccupante)' },
  // Mesures judiciaires civiles (Juge des enfants)
  { value: 'aemo', label: 'AEMO (Action Éducative en Milieu Ouvert)' },
  { value: 'aemo-r', label: 'AEMO renforcée' },
  { value: 'placement-ase', label: 'Placement ASE (ordonnance du JE)' },
  { value: 'placement-direct', label: 'Placement direct (chez un tiers)' },
  { value: 'dap', label: 'DAP (Délégation d\'Autorité Parentale)' },
  { value: 'retrait-autorite', label: 'Retrait de l\'autorité parentale' },
  { value: 'tutelle', label: 'Tutelle' },
  // Mesures judiciaires pénales (PJJ)
  { value: 'pjj-mo', label: 'PJJ — Milieu ouvert (UEMO)' },
  { value: 'pjj-placement', label: 'PJJ — Placement (CEF, EPE, UEAJ)' },
  { value: 'pjj-detention', label: 'PJJ — Détention' },
  { value: 'tig', label: 'TIG (Travail d\'Intérêt Général)' },
  { value: 'controle-judiciaire', label: 'Contrôle judiciaire' },
  { value: 'sursis-probatoire', label: 'Sursis probatoire' },
  // Mesures spécifiques
  { value: 'mna', label: 'Prise en charge MNA' },
  { value: 'mjie', label: 'MJIE (Mesure Judiciaire d\'Investigation Éducative)' },
  { value: 'aesf', label: 'AESF (Aide Éducative et Sociale aux Familles)' },
] as const

export const REGIMES_ALIMENTAIRES = [
  { value: 'standard', label: 'Standard' },
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegetalien', label: 'Végétalien' },
  { value: 'halal', label: 'Halal' },
  { value: 'casher', label: 'Casher' },
  { value: 'sans-gluten', label: 'Sans gluten' },
  { value: 'sans-lactose', label: 'Sans lactose' },
  { value: 'autre', label: 'Autre' },
] as const

export const LIEUX_HEBERGEMENT = [
  { value: '', label: 'Non renseigné' },
  { value: 'foyer', label: 'Foyer / MECS' },
  { value: 'famille-accueil', label: 'Famille d\'accueil' },
  { value: 'famille', label: 'Famille (domicile parental)' },
  { value: 'autonome', label: 'Logement autonome' },
  { value: 'hebergement-urgence', label: 'Hébergement d\'urgence' },
  { value: 'sans-domicile', label: 'Sans domicile fixe' },
  { value: 'autre', label: 'Autre' },
] as const

export const LIENS_CONTACT = [
  { value: 'pere', label: 'Père' },
  { value: 'mere', label: 'Mère' },
  { value: 'tuteur', label: 'Tuteur légal' },
  { value: 'educateur', label: 'Éducateur référent' },
  { value: 'famille', label: 'Autre membre de la famille' },
  { value: 'autre', label: 'Autre' },
] as const

export const FONCTIONS_REFERENT = [
  { value: '', label: 'Selectionnez...' },
  { value: 'educateur-ase', label: 'Éducateur ASE' },
  { value: 'educateur-pjj', label: 'Éducateur PJJ' },
  { value: 'assistante-sociale', label: 'Assistante sociale' },
  { value: 'chef-service', label: 'Chef de service' },
  { value: 'referent-mna', label: 'Référent MNA' },
  { value: 'autre', label: 'Autre' },
] as const

export const SPECIALITES_MEDICALES = [
  { value: '', label: 'Selectionnez...' },
  { value: 'generaliste', label: 'Médecin généraliste' },
  { value: 'psychiatre', label: 'Psychiatre' },
  { value: 'psychologue', label: 'Psychologue' },
  { value: 'orthophoniste', label: 'Orthophoniste' },
  { value: 'psychomotricien', label: 'Psychomotricien' },
  { value: 'ergotherapeute', label: 'Ergothérapeute' },
  { value: 'kinesitherapeute', label: 'Kinésithérapeute' },
  { value: 'neurologue', label: 'Neurologue' },
  { value: 'orl', label: 'ORL' },
  { value: 'ophtalmologue', label: 'Ophtalmologue' },
  { value: 'dentiste', label: 'Dentiste' },
  { value: 'autre', label: 'Autre' },
] as const

export const FREQUENCES_SUIVI = [
  { value: '', label: 'Selectionnez...' },
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'bimensuel', label: 'Bimensuel' },
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'trimestriel', label: 'Trimestriel' },
  { value: 'ponctuel', label: 'Ponctuel' },
] as const

export const TYPES_SUIVI_PSY = [
  { value: '', label: 'Selectionnez...' },
  { value: 'psychologue', label: 'Psychologue' },
  { value: 'psychiatre', label: 'Psychiatre' },
  { value: 'psychotherapeute', label: 'Psychothérapeute' },
  { value: 'cmp', label: 'CMP (Centre Médico-Psychologique)' },
  { value: 'autre', label: 'Autre' },
] as const

export const LIENS_FAMILIAUX = [
  { value: '', label: 'Lien...' },
  { value: 'pere', label: 'Père' },
  { value: 'mere', label: 'Mère' },
  { value: 'beau-pere', label: 'Beau-père' },
  { value: 'belle-mere', label: 'Belle-mère' },
  { value: 'frere', label: 'Frère' },
  { value: 'soeur', label: 'Soeur' },
  { value: 'demi-frere', label: 'Demi-frère' },
  { value: 'demi-soeur', label: 'Demi-soeur' },
  { value: 'grand-pere', label: 'Grand-père' },
  { value: 'grand-mere', label: 'Grand-mère' },
  { value: 'oncle-tante', label: 'Oncle / Tante' },
  { value: 'autre', label: 'Autre' },
] as const

// ─── Helpers pour parser les champs structurés depuis la DB ───

function parseArrayField(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    } catch { /* not JSON */ }
    // Legacy: plain text → wrap in single-element array
    return [raw]
  }
  return []
}

function parseJsonField<T>(raw: unknown, fallback: T): T {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as T
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') return parsed as T
    } catch { /* not JSON */ }
  }
  return fallback
}

function parseJsonArrayField<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as T[]
    } catch { /* not JSON */ }
  }
  return []
}

// ─── Default values ───

export function emptyReferentAse(): ReferentAse {
  return { nom: '', fonction: '', telephone: '', email: '' }
}

export function emptySuiviPsychologique(): SuiviPsychologique {
  return { enCours: false, type: '', frequence: '', notes: '' }
}

export function emptyMedecinTraitant(): MedecinTraitant {
  return { nom: '', telephone: '', adresse: '', codePostal: '', specialite: '' }
}

export function emptyMembreFamille(): MembreFamille {
  return { lien: '', prenom: '', age: '', vitAvec: false }
}

export function emptySuiviMedicalEntry(): SuiviMedicalEntry {
  return { specialite: '', frequence: '', details: '' }
}

// ─── Mapper DB row → TypeScript ───

export function toJeuneSante(row: Record<string, unknown>): JeuneSante {
  let contacts: ContactUrgence[] = []
  try {
    const raw = row.contacts_urgence
    if (typeof raw === 'string' && raw) contacts = JSON.parse(raw)
    else if (Array.isArray(raw)) contacts = raw as ContactUrgence[]
  } catch { /* invalid JSON → empty */ }

  // Legacy: referentAse was a plain string → migrate to structured
  const referentAseRaw = row.referent_ase
  let referentAse: ReferentAse
  if (typeof referentAseRaw === 'string' && referentAseRaw && !referentAseRaw.startsWith('{')) {
    referentAse = { nom: referentAseRaw, fonction: '', telephone: '', email: '' }
  } else {
    referentAse = parseJsonField(referentAseRaw, emptyReferentAse())
  }

  // Legacy: medecinTraitant was a plain string
  const medecinRaw = row.medecin_traitant
  let medecinTraitant: MedecinTraitant
  if (typeof medecinRaw === 'string' && medecinRaw && !medecinRaw.startsWith('{')) {
    medecinTraitant = { nom: medecinRaw, telephone: '' }
  } else {
    medecinTraitant = parseJsonField(medecinRaw, emptyMedecinTraitant())
  }

  // Legacy: suiviPsychologique was a plain string
  const suiviPsyRaw = row.suivi_psychologique
  let suiviPsychologique: SuiviPsychologique
  if (typeof suiviPsyRaw === 'string' && suiviPsyRaw && !suiviPsyRaw.startsWith('{')) {
    suiviPsychologique = { enCours: true, type: '', frequence: '', notes: suiviPsyRaw }
  } else {
    suiviPsychologique = parseJsonField(suiviPsyRaw, emptySuiviPsychologique())
  }

  // Legacy: mesureProtection was a single string
  const mesureRaw = row.mesure_protection
  let mesureProtection: string[]
  if (typeof mesureRaw === 'string' && mesureRaw && !mesureRaw.startsWith('[')) {
    mesureProtection = mesureRaw ? [mesureRaw] : []
  } else {
    mesureProtection = parseArrayField(mesureRaw)
  }

  // Legacy: compositionFamiliale was a plain string
  const compoRaw = row.composition_familiale
  let compositionFamiliale: MembreFamille[]
  if (typeof compoRaw === 'string' && compoRaw && !compoRaw.startsWith('[')) {
    compositionFamiliale = []  // Can't auto-migrate free text to structured
  } else {
    compositionFamiliale = parseJsonArrayField<MembreFamille>(compoRaw)
  }

  // Legacy: suiviMedical was a plain string
  const suiviMedRaw = row.suivi_medical
  let suiviMedical: SuiviMedicalEntry[]
  if (typeof suiviMedRaw === 'string' && suiviMedRaw && !suiviMedRaw.startsWith('[')) {
    suiviMedical = []  // Can't auto-migrate free text
  } else {
    suiviMedical = parseJsonArrayField<SuiviMedicalEntry>(suiviMedRaw)
  }

  return {
    id: row.id as string,
    jeuneId: row.jeune_id as string,
    allergies: parseArrayField(row.allergies),
    handicap: (row.handicap as string) ?? '',
    tauxInvalidite: (row.taux_invalidite as string) ?? '',
    suiviPsychologique,
    suiviMedical,
    traitementsEnCours: parseArrayField(row.traitements_en_cours),
    regimeAlimentaire: parseArrayField(row.regime_alimentaire),
    contactsUrgence: contacts,
    medecinTraitant,
    mesureProtection,
    referentAse,
    compositionFamiliale,
    lieuHebergement: (row.lieu_hebergement as string) ?? '',
    droitsParentaux: (row.droits_parentaux as string) ?? '',
    notesConfidentielles: (row.notes_confidentielles as string) ?? '',
    derniereMiseAJour: (row.derniere_mise_a_jour as string) ?? '',
    misAJourPar: (row.mis_a_jour_par as string) ?? '',
  }
}

// ─── Empty default for new fiches ───

export function emptySanteInput(): JeuneSanteInput {
  return {
    allergies: [],
    handicap: '',
    tauxInvalidite: '',
    suiviPsychologique: emptySuiviPsychologique(),
    suiviMedical: [],
    traitementsEnCours: [],
    regimeAlimentaire: [],
    contactsUrgence: [],
    medecinTraitant: emptyMedecinTraitant(),
    mesureProtection: ['aucune'],
    referentAse: emptyReferentAse(),
    compositionFamiliale: [],
    lieuHebergement: '',
    droitsParentaux: '',
    notesConfidentielles: '',
  }
}
