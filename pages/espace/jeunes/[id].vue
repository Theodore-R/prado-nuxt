<script setup lang="ts">
import { ArrowLeft, Pencil, Check, X, Trash2, Loader2, Calendar, Plus, StickyNote } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const SITUATIONS = [
  { value: '', label: 'Non renseigne' },
  { value: 'sans_emploi', label: 'Sans emploi' },
  { value: 'scolarise_ordinaire', label: 'Scolarise(e) en milieu ordinaire' },
  { value: 'scolarise_medico_social', label: 'Scolarise(e) en milieu medico-social' },
  { value: 'emploi_formation', label: 'Emploi / Formation' },
  { value: 'autre', label: 'Autre' },
] as const

const SEXES = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
] as const

const ACCOMPAGNEMENT_OPTIONS = [
  { value: 'ase', label: 'ASE' },
  { value: 'pjj', label: 'PJJ' },
  { value: 'mission_locale', label: 'Mission locale' },
  { value: 'prevention_specialisee', label: 'Prevention specialisee' },
  { value: 'insertion', label: 'Insertion' },
  { value: 'handicap', label: 'Handicap' },
  { value: 'autre', label: 'Autre' },
] as const

definePageMeta({ layout: 'espace', middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string
const { jeunes, inscriptions, editJeune, desinscrire, inscrire } = useAuth()
const { confirm } = useConfirm()
const { checkConflict } = useConflictCheck()

const jeune = computed(() => jeunes.value.find(j => j.id === id))

// Actions map for inscription display + picker + conflict detection
const { data: actionsData } = await useAsyncData('espace-jeune-actions-map', () =>
  $fetch<{ id: number; title: string; date: string | null }[]>('/api/actions/map'),
)

const actionMap = computed(() => {
  const map = new Map<string, { id: number; title: string; date: string | null }>()
  for (const a of actionsData.value ?? []) {
    map.set(String(a.id), a)
  }
  return map
})

const jeuneInscriptions = computed(() =>
  inscriptions.value
    .filter(i => i.jeuneId === id)
    .map(insc => {
      const action = actionMap.value.get(insc.actionId)
      return {
        id: insc.id,
        actionTitle: action?.title ?? 'Action inconnue',
        actionId: action?.id,
        date: insc.date,
      }
    }),
)

// Inline editing
const editing = ref<string | null>(null)
const editValue = ref('')
const saving = ref(false)

// Multi-value editing for accompagnementType
const editMultiValue = ref<string[]>([])

const situationLabel = computed(() => {
  if (!jeune.value?.situation) return ''
  const found = SITUATIONS.find(s => s.value === jeune.value!.situation)
  return found ? found.label : jeune.value.situation
})

const sexLabel = computed(() => {
  if (!jeune.value?.sex) return 'Non renseigne'
  const found = SEXES.find(s => s.value === jeune.value!.sex)
  return found ? found.label : jeune.value.sex
})

const accompagnementLabel = computed(() => {
  if (!jeune.value?.accompagnementType || jeune.value.accompagnementType.length === 0) return 'Non renseigne'
  return jeune.value.accompagnementType
    .map(v => ACCOMPAGNEMENT_OPTIONS.find(o => o.value === v)?.label ?? v)
    .join(', ')
})

const fields = computed(() => {
  if (!jeune.value) return []
  return [
    { key: 'firstName', label: 'Prenom', value: jeune.value.firstName },
    { key: 'lastName', label: 'Nom', value: jeune.value.lastName },
    { key: 'sex', label: 'Sexe', value: jeune.value.sex, display: sexLabel.value, type: 'sex' },
    { key: 'dateOfBirth', label: 'Date de naissance', value: jeune.value.dateOfBirth, display: new Date(jeune.value.dateOfBirth).toLocaleDateString('fr-FR'), type: 'dateOfBirth' },
    { key: 'situation', label: 'Situation', value: jeune.value.situation, display: situationLabel.value, type: 'situation' },
    { key: 'isQpv', label: 'QPV', value: String(jeune.value.isQpv), display: jeune.value.isQpv ? 'Oui' : 'Non', type: 'checkbox' },
    { key: 'accompagnementType', label: 'Accompagnement au titre de', value: (jeune.value.accompagnementType ?? []).join(','), display: accompagnementLabel.value, type: 'multiCheckbox' },
  ]
})

function startEdit(key: string, value: string) {
  editing.value = key
  if (key === 'accompagnementType') {
    editMultiValue.value = [...(jeune.value?.accompagnementType ?? [])]
  } else {
    editValue.value = value
  }
}

function cancelEdit() {
  editing.value = null
  editValue.value = ''
  editMultiValue.value = []
}

async function saveEdit(key: string) {
  saving.value = true
  try {
    if (key === 'isQpv') {
      await editJeune(id, { isQpv: editValue.value === 'true' })
    } else if (key === 'accompagnementType') {
      await editJeune(id, { accompagnementType: editMultiValue.value })
    } else {
      if (!editValue.value.trim()) return
      await editJeune(id, { [key]: editValue.value })
    }
    toast.success('Modification enregistree')
    editing.value = null
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur')
  } finally {
    saving.value = false
  }
}

async function handleDesinscrire(inscriptionId: string, actionTitle: string) {
  const ok = await confirm(`Desinscrire de "${actionTitle}" ?`, { variant: 'warning' })
  if (!ok) return
  try {
    await desinscrire(inscriptionId)
    toast.info('Inscription annulee')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur')
  }
}

// Action picker
const showPicker = ref(false)
const selectedAction = ref('')
const inscribing = ref(false)

const availableActions = computed(() => {
  const inscribedActionIds = new Set(
    inscriptions.value.filter(i => i.jeuneId === id).map(i => i.actionId),
  )
  return Array.from(actionMap.value.entries())
    .filter(([actionId]) => !inscribedActionIds.has(actionId))
    .map(([actionId, action]) => ({ id: actionId, title: action.title }))
})

async function handleInscrire() {
  if (!selectedAction.value) return
  inscribing.value = true
  // Conflict check (warning only)
  const selectedActionEntry = actionMap.value.get(selectedAction.value)
  checkConflict(id, selectedAction.value, selectedActionEntry?.date ?? null, actionMap.value as any)
  try {
    await inscrire(selectedAction.value, null, id)
    toast.success('Inscription reussie')
    showPicker.value = false
    selectedAction.value = ''
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur')
  } finally {
    inscribing.value = false
  }
}

// Notes internes
const editingNotes = ref(false)
const notesValue = ref('')
const savingNotes = ref(false)

function startEditNotes() {
  notesValue.value = jeune.value?.notes ?? ''
  editingNotes.value = true
}

async function saveNotes() {
  savingNotes.value = true
  try {
    await editJeune(id, { notes: notesValue.value })
    toast.success('Notes enregistrees')
    editingNotes.value = false
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur')
  } finally {
    savingNotes.value = false
  }
}

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <!-- Back link -->
    <NuxtLink
      to="/espace/jeunes"
      class="inline-flex items-center gap-1.5 text-sm text-prado-text-muted hover:text-prado-text transition-colors"
    >
      <ArrowLeft :size="14" /> Retour a la liste
    </NuxtLink>

    <div v-if="!jeune" class="text-center py-16">
      <p class="text-prado-text-muted">Jeune introuvable.</p>
      <NuxtLink to="/espace/jeunes" class="text-sm text-prado-teal hover:underline mt-2 inline-block">
        Retour
      </NuxtLink>
    </div>

    <template v-else>
      <h1 class="text-xl font-semibold text-prado-text italic">
        {{ jeune.firstName }} {{ jeune.lastName }}
      </h1>

      <!-- Info fields with inline edit -->
      <div class="bg-prado-surface rounded-2xl border border-prado-border divide-y divide-prado-border">
        <div
          v-for="field in fields"
          :key="field.key"
          class="flex items-center gap-4 px-5 py-4"
        >
          <span class="text-sm text-prado-text-muted w-40 shrink-0">{{ field.label }}</span>

          <!-- Editing mode -->
          <template v-if="editing === field.key">
            <div v-if="field.type === 'dateOfBirth'" class="flex-1">
              <UiDateOfBirthPicker v-model="editValue" />
            </div>
            <select
              v-else-if="field.type === 'situation'"
              v-model="editValue"
              :class="inputClass"
              class="flex-1"
            >
              <option v-for="s in SITUATIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
            <select
              v-else-if="field.type === 'sex'"
              v-model="editValue"
              :class="inputClass"
              class="flex-1"
            >
              <option v-for="s in SEXES" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
            <label
              v-else-if="field.type === 'checkbox'"
              class="flex-1 flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="editValue === 'true'"
                class="rounded border-prado-border text-prado-teal focus:ring-prado-teal"
                @change="editValue = ($event.target as HTMLInputElement).checked ? 'true' : 'false'"
              />
              <span class="text-sm text-prado-text">Quartier Prioritaire de la Ville</span>
            </label>
            <div v-else-if="field.type === 'multiCheckbox'" class="flex-1">
              <UiMultiCheckbox
                v-model="editMultiValue"
                :options="ACCOMPAGNEMENT_OPTIONS"
              />
            </div>
            <input
              v-else
              v-model="editValue"
              :type="field.type ?? 'text'"
              :class="inputClass"
              class="flex-1"
              @keyup.enter="saveEdit(field.key)"
              @keyup.escape="cancelEdit"
            />
            <button
              :disabled="saving"
              class="p-1.5 rounded-lg hover:bg-prado-signature/20 text-prado-signature transition-colors"
              @click="saveEdit(field.key)"
            >
              <Loader2 v-if="saving" :size="15" class="animate-spin" />
              <Check v-else :size="15" />
            </button>
            <button
              class="p-1.5 rounded-lg hover:bg-prado-surface-hover text-prado-text-muted transition-colors"
              @click="cancelEdit"
            >
              <X :size="15" />
            </button>
          </template>

          <!-- Display mode -->
          <template v-else>
            <span class="flex-1 text-sm text-prado-text">{{ field.display ?? field.value }}</span>
            <button
              class="p-1.5 rounded-lg hover:bg-prado-surface-hover text-prado-text-faint hover:text-prado-text-muted transition-colors"
              @click="startEdit(field.key, field.value)"
            >
              <Pencil :size="14" />
            </button>
          </template>
        </div>
      </div>

      <!-- Notes internes -->
      <div class="bg-prado-surface rounded-2xl border border-prado-border p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-sm font-semibold text-prado-text">
            <StickyNote :size="15" class="text-prado-text-faint" />
            Notes internes
          </div>
          <button
            v-if="!editingNotes"
            class="p-1.5 rounded-lg hover:bg-prado-surface-hover text-prado-text-faint hover:text-prado-text-muted transition-colors"
            @click="startEditNotes"
          >
            <Pencil :size="14" />
          </button>
        </div>

        <template v-if="editingNotes">
          <textarea
            v-model="notesValue"
            rows="4"
            :class="inputClass"
            placeholder="Notes privees sur ce jeune (non visibles par le jeune)..."
          />
          <div class="flex justify-end gap-2 mt-2">
            <button
              class="px-3 py-1.5 rounded-lg text-sm text-prado-text-muted hover:bg-prado-surface-hover transition-colors"
              @click="editingNotes = false"
            >
              Annuler
            </button>
            <button
              :disabled="savingNotes"
              class="px-3 py-1.5 rounded-lg text-sm bg-prado-teal text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
              @click="saveNotes"
            >
              <Loader2 v-if="savingNotes" :size="14" class="animate-spin" />
              Enregistrer
            </button>
          </div>
        </template>
        <template v-else>
          <p
            v-if="jeune.notes"
            class="text-sm text-prado-text-muted whitespace-pre-line"
          >
            {{ jeune.notes }}
          </p>
          <p
            v-else
            class="text-sm text-prado-text-faint italic cursor-pointer hover:text-prado-text-muted transition-colors"
            @click="startEditNotes"
          >
            Aucune note — cliquez pour en ajouter
          </p>
        </template>
      </div>

      <!-- Inscriptions -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-prado-text">
            Inscriptions ({{ jeuneInscriptions.length }})
          </h2>
          <button
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-prado-teal text-white text-sm hover:opacity-90 transition-opacity"
            @click="showPicker = !showPicker"
          >
            <Plus :size="14" /> Inscrire a une action
          </button>
        </div>

        <!-- Action picker -->
        <div
          v-if="showPicker"
          class="bg-prado-surface border border-prado-border rounded-2xl p-4 mb-4"
        >
          <label class="text-xs text-prado-text-muted mb-2 block">Choisir une action</label>
          <div class="flex gap-2">
            <select v-model="selectedAction" :class="inputClass" class="flex-1">
              <option value="" disabled>-- Selectionnez --</option>
              <option v-for="a in availableActions" :key="a.id" :value="a.id">
                {{ a.title }}
              </option>
            </select>
            <button
              :disabled="!selectedAction || inscribing"
              class="px-4 py-2 rounded-xl bg-prado-signature text-prado-signature-text text-sm disabled:opacity-50 flex items-center gap-1.5"
              @click="handleInscrire"
            >
              <Loader2 v-if="inscribing" :size="14" class="animate-spin" />
              Inscrire
            </button>
          </div>
        </div>

        <!-- Inscriptions list -->
        <div v-if="jeuneInscriptions.length === 0" class="text-sm text-prado-text-muted text-center py-6 bg-prado-surface rounded-2xl border border-prado-border">
          Aucune inscription pour ce jeune.
        </div>
        <div v-else class="bg-prado-surface rounded-2xl border border-prado-border divide-y divide-prado-border">
          <div
            v-for="insc in jeuneInscriptions"
            :key="insc.id"
            class="flex items-center gap-3 px-5 py-3"
          >
            <Calendar :size="16" class="text-prado-text-faint flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <NuxtLink
                v-if="insc.actionId"
                :to="`/actions/${insc.actionId}`"
                class="text-sm text-prado-teal hover:underline"
              >
                {{ insc.actionTitle }}
              </NuxtLink>
              <span v-else class="text-sm text-prado-text">{{ insc.actionTitle }}</span>
              <p class="text-xs text-prado-text-faint">
                Inscrit le {{ new Date(insc.date).toLocaleDateString('fr-FR') }}
              </p>
            </div>
            <button
              class="p-1.5 rounded-lg hover:bg-red-500/10 text-prado-text-muted hover:text-red-400 transition-colors"
              title="Desinscrire"
              @click="handleDesinscrire(insc.id, insc.actionTitle)"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>
