import { toast } from 'vue-sonner'
import type { JeuneSante, JeuneSanteInput } from '~/lib/types/sante'
import { emptySanteInput } from '~/lib/types/sante'

export function useSante(jeuneId: Ref<string> | string) {
  const id = typeof jeuneId === 'string' ? ref(jeuneId) : jeuneId

  const data = ref<JeuneSante | null>(null)
  const form = ref<JeuneSanteInput>(emptySanteInput())
  const loading = ref(false)
  const saving = ref(false)
  const loaded = ref(false)

  const hasData = computed(() => data.value !== null)

  async function load() {
    if (loaded.value) return
    loading.value = true
    try {
      const result = await $fetch<JeuneSante | null>(`/api/jeunes/${id.value}/sante`)
      data.value = result
      if (result) {
        form.value = {
          allergies: [...result.allergies],
          handicap: result.handicap,
          tauxInvalidite: result.tauxInvalidite,
          suiviPsychologique: { ...result.suiviPsychologique },
          suiviMedical: result.suiviMedical.map(e => ({ ...e })),
          traitementsEnCours: [...result.traitementsEnCours],
          regimeAlimentaire: [...result.regimeAlimentaire],
          contactsUrgence: result.contactsUrgence.map(c => ({ ...c })),
          medecinTraitant: { ...result.medecinTraitant },
          mesureProtection: [...result.mesureProtection],
          referentAse: { ...result.referentAse },
          compositionFamiliale: result.compositionFamiliale.map(m => ({ ...m })),
          lieuHebergement: result.lieuHebergement,
          droitsParentaux: result.droitsParentaux,
          notesConfidentielles: result.notesConfidentielles,
        }
      } else {
        form.value = emptySanteInput()
      }
      loaded.value = true
    } catch {
      toast.error('Erreur lors du chargement des donnees de sante')
    } finally {
      loading.value = false
    }
  }

  async function save() {
    saving.value = true
    try {
      const result = await $fetch<JeuneSante>(`/api/jeunes/${id.value}/sante`, {
        method: 'PUT',
        body: form.value,
      })
      data.value = result
      toast.success('Fiche sante enregistree')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      saving.value = false
    }
  }

  async function remove() {
    try {
      await $fetch(`/api/jeunes/${id.value}/sante`, { method: 'DELETE' })
      data.value = null
      form.value = emptySanteInput()
      loaded.value = false
      toast.info('Donnees de sante supprimees')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return { data, form, loading, saving, loaded, hasData, load, save, remove }
}
