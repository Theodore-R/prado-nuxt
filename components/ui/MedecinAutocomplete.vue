<script setup lang="ts">
import { Search, Loader2, X, Pencil } from 'lucide-vue-next'
import type { MedecinTraitant } from '~/lib/types/sante'

const model = defineModel<MedecinTraitant>({ required: true })

interface ApiResult {
  nom: string
  civilite: string
  libelle_profession: string
  adresse3: string | null
  code_postal: string | null
  telephone: string | null
  convention: string | null
}

const query = ref(model.value.nom)
const suggestions = ref<ApiResult[]>([])
const showSuggestions = ref(false)
const loading = ref(false)
const selected = ref(!!model.value.nom)
const showManualForm = ref(false)
const manualForm = ref<MedecinTraitant>({ nom: '', telephone: '', adresse: '', codePostal: '', specialite: '' })
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => model.value.nom, (val) => {
  if (val !== query.value && !selected.value) query.value = val
})

function handleInput(value: string) {
  query.value = value
  selected.value = false

  if (debounceTimer) clearTimeout(debounceTimer)

  if (value.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  debounceTimer = setTimeout(() => fetchSuggestions(value), 350)
}

async function fetchSuggestions(q: string) {
  loading.value = true
  try {
    const encodedName = encodeURIComponent(q.toUpperCase())
    const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/annuaire-des-professionnels-de-sante/records`
    const res = await $fetch<{ results: ApiResult[] }>(url, {
      params: {
        where: `nom like "${encodedName}"`,
        select: 'nom,civilite,libelle_profession,adresse3,code_postal,telephone,convention',
        group_by: 'nom,civilite,libelle_profession,adresse3,code_postal,telephone,convention',
        limit: 8,
      },
    })
    suggestions.value = res.results ?? []
    showSuggestions.value = suggestions.value.length > 0
  } catch {
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

function selectMedecin(m: ApiResult) {
  const formatted: MedecinTraitant = {
    nom: formatName(m.nom),
    telephone: m.telephone ?? '',
    adresse: m.adresse3 ?? '',
    codePostal: m.code_postal ?? '',
    specialite: m.libelle_profession ?? '',
  }
  model.value = formatted
  query.value = formatted.nom
  selected.value = true
  showSuggestions.value = false
}

function clearSelection() {
  model.value = { nom: '', telephone: '', adresse: '', codePostal: '', specialite: '' }
  query.value = ''
  selected.value = false
  showManualForm.value = false
}

function openManualForm() {
  manualForm.value = {
    nom: query.value || '',
    telephone: '',
    adresse: '',
    codePostal: '',
    specialite: 'Médecin généraliste',
  }
  showManualForm.value = true
}

function saveManualForm() {
  if (!manualForm.value.nom.trim()) return
  model.value = { ...manualForm.value }
  query.value = manualForm.value.nom
  selected.value = true
  showManualForm.value = false
}

function formatName(raw: string): string {
  return raw.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function handleBlur() {
  setTimeout(() => { showSuggestions.value = false }, 200)
}

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <div class="space-y-2">
    <!-- State 1: Selected medecin card (replaces everything) -->
    <div
      v-if="selected && model.nom && !showManualForm"
      class="bg-prado-bg rounded-xl p-3 border border-prado-border"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-prado-text">{{ model.nom }}</p>
          <p v-if="model.specialite" class="text-xs text-prado-teal">{{ model.specialite }}</p>
          <p v-if="model.adresse || model.codePostal" class="text-xs text-prado-text-muted mt-0.5">
            {{ model.adresse }}<span v-if="model.codePostal">, {{ model.codePostal }}</span>
          </p>
          <p v-if="model.telephone" class="text-xs text-prado-text-muted">{{ model.telephone }}</p>
        </div>
        <button
          class="p-1 rounded-lg hover:bg-red-500/10 text-prado-text-faint hover:text-red-400 transition-colors"
          @click="clearSelection"
        >
          <X :size="14" />
        </button>
      </div>
    </div>

    <!-- State 2: Search bar (only when no medecin selected and no manual form) -->
    <template v-else-if="!showManualForm">
      <div class="relative">
        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-prado-text-faint">
          <Loader2 v-if="loading" :size="14" class="animate-spin" />
          <Search v-else :size="14" />
        </div>
        <input
          :value="query"
          type="text"
          :class="inputClass"
          class="pl-9 pr-8"
          placeholder="Rechercher un medecin (nom, prenom)..."
          autocomplete="off"
          @input="handleInput(($event.target as HTMLInputElement).value)"
          @focus="showSuggestions = suggestions.length > 0"
          @blur="handleBlur"
        />
        <button
          v-if="query"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-prado-surface-hover text-prado-text-faint transition-colors"
          @click="clearSelection"
        >
          <X :size="12" />
        </button>
      </div>

      <!-- Suggestions dropdown -->
      <div v-if="showSuggestions && suggestions.length > 0" class="relative">
        <div class="absolute z-50 left-0 right-0 top-0 mt-0.5 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto border border-prado-border" style="background-color: var(--prado-surface);">
          <button
            v-for="(m, i) in suggestions"
            :key="i"
            type="button"
            class="w-full text-left px-3 py-2.5 hover:bg-prado-surface-hover transition-colors border-b border-prado-border last:border-0" style="background-color: var(--prado-surface);"
            @mousedown.prevent="selectMedecin(m)"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-prado-text">{{ formatName(m.nom) }}</span>
              <span class="text-[10px] text-prado-text-faint ml-2">{{ m.libelle_profession }}</span>
            </div>
            <div class="text-xs text-prado-text-muted mt-0.5">
              <span v-if="m.adresse3">{{ m.adresse3 }}, </span>
              <span v-if="m.code_postal">{{ m.code_postal }}</span>
              <span v-if="m.telephone" class="ml-2">{{ m.telephone }}</span>
            </div>
            <span v-if="m.convention" class="text-[10px] text-prado-text-faint">{{ m.convention }}</span>
          </button>
        </div>
      </div>

      <!-- Manual input link -->
      <div class="text-[10px] text-prado-text-faint">
        Recherchez dans l'Annuaire Sante ou
        <button
          type="button"
          class="text-prado-teal hover:underline"
          @click="openManualForm"
        >
          saisissez manuellement
        </button>
      </div>
    </template>

    <!-- State 3: Manual form -->
    <div v-if="showManualForm" class="bg-prado-bg rounded-xl border border-prado-border p-4 space-y-3">
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-2">
          <Pencil :size="14" class="text-prado-text-faint" />
          <span class="text-sm font-medium text-prado-text">Saisie manuelle</span>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg hover:bg-prado-surface-hover text-prado-text-faint transition-colors"
          @click="showManualForm = false"
        >
          <X :size="14" />
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label class="text-[10px] text-prado-text-faint mb-0.5 block">Nom du medecin *</label>
          <input v-model="manualForm.nom" :class="inputClass" placeholder="Dr. Dupont" />
        </div>
        <div>
          <label class="text-[10px] text-prado-text-faint mb-0.5 block">Specialite</label>
          <input v-model="manualForm.specialite" :class="inputClass" placeholder="Medecin generaliste" />
        </div>
        <div>
          <label class="text-[10px] text-prado-text-faint mb-0.5 block">Telephone</label>
          <UiPhoneInput v-model="manualForm.telephone" />
        </div>
        <div>
          <label class="text-[10px] text-prado-text-faint mb-0.5 block">Adresse</label>
          <input v-model="manualForm.adresse" :class="inputClass" placeholder="12 rue de la Paix" />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-1">
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs text-prado-text-muted hover:bg-prado-surface-hover transition-colors"
          @click="showManualForm = false"
        >
          Annuler
        </button>
        <button
          type="button"
          :disabled="!manualForm.nom.trim()"
          class="px-3 py-1.5 rounded-lg text-xs bg-prado-teal text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          @click="saveManualForm"
        >
          Enregistrer
        </button>
      </div>
    </div>
  </div>
</template>
