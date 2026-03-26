import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'
import { toJeuneSante } from '~/lib/types/sante'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const jeuneId = getRouterParam(event, 'id')
  if (!jeuneId) throw createError({ statusCode: 400, message: 'id requis' })

  const body = await readBody(event)
  if (!body) throw createError({ statusCode: 400, message: 'Corps de requête vide' })

  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  // Verify ownership
  const { data: jeune } = await supabase
    .from('jeunes')
    .select('prescripteur_id')
    .eq('id', jeuneId)
    .single()

  if (!jeune) throw createError({ statusCode: 404, message: 'Jeune introuvable' })

  const { data: prescripteur } = await supabase
    .from('prescripteurs')
    .select('role')
    .eq('id', user.id)
    .single()

  if (jeune.prescripteur_id !== user.id && prescripteur?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  const row = {
    jeune_id: jeuneId,
    allergies: body.allergies ?? '',
    handicap: body.handicap ?? '',
    taux_invalidite: body.tauxInvalidite ?? '',
    suivi_psychologique: body.suiviPsychologique ?? '',
    suivi_medical: body.suiviMedical ?? '',
    traitements_en_cours: body.traitementsEnCours ?? '',
    regime_alimentaire: body.regimeAlimentaire ?? '',
    contacts_urgence: body.contactsUrgence ?? [],
    medecin_traitant: body.medecinTraitant ?? '',
    mesure_protection: body.mesureProtection ?? '',
    referent_ase: body.referentAse ?? '',
    composition_familiale: body.compositionFamiliale ?? '',
    lieu_hebergement: body.lieuHebergement ?? '',
    droits_parentaux: body.droitsParentaux ?? '',
    notes_confidentielles: body.notesConfidentielles ?? '',
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
