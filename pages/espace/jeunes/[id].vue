<script setup lang="ts">
import { ArrowLeft, Pencil, Check, X, Trash2, Loader2, Calendar, Plus, StickyNote } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

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

const fields = computed(() => {
  if (!jeune.value) return []
  return [
    { key: 'firstName', label: 'Prenom', value: jeune.value.firstName },
    { key: 'lastName', label: 'Nom', value: jeune.value.lastName },
    { key: 'dateOfBirth', label: 'Date de naissance', value: jeune.value.dateOfBirth, display: new Date(jeune.value.dateOfBirth).toLocaleDateString('fr-FR'), type: 'date' },
    { key: 'address', label: 'Adresse', value: jeune.value.address },
    { key: 'situation', label: 'Situation', value: jeune.value.situation },
  ]
})

function startEdit(key: string, value: string) {
  editing.value = key
  editValue.value = value
}

function cancelEdit() {
  editing.value = null
  editValue.value = ''
}

async function saveEdit(key: string) {
  if (!editValue.value.trim()) return
  saving.value = true
  try {
    await editJeune(id, { [key]: editValue.value })
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
  checkConflict(id, selectedAction.value, selectedActionEntry?.date ?? null, actionMap.value)
  try {
    await inscrire(selectedAction.value, id)
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
      <NuxtLink to="/espace/jeunes" class="text-sm text-[#004657] hover:underline mt-2 inline-block">
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
            <input
              v-model="editValue"
              :type="field.type ?? 'text'"
              :class="inputClass"
              class="flex-1"
              @keyup.enter="saveEdit(field.key)"
              @keyup.escape="cancelEdit"
            />
            <button
              :disabled="saving"
              class="p-1.5 rounded-lg hover:bg-[#93C1AF]/20 text-[#93C1AF] transition-colors"
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
              class="px-3 py-1.5 rounded-lg text-sm bg-[#004657] text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
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
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#004657] text-white text-sm hover:opacity-90 transition-opacity"
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
              class="px-4 py-2 rounded-xl bg-[#93C1AF] text-white text-sm disabled:opacity-50 flex items-center gap-1.5"
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
                class="text-sm text-[#004657] hover:underline"
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
