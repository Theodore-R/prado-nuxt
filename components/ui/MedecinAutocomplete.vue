<script setup lang="ts">
import { Search, Loader2, X } from 'lucide-vue-next'
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
}

function formatName(raw: string): string {
  // "JEAN DUPONT" → "Jean Dupont"
  return raw.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function handleBlur() {
  setTimeout(() => { showSuggestions.value = false }, 200)
}

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <div class="space-y-2">
    <!-- Search input -->
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
        @focus="showSuggestions = suggestions.length > 0 && !selected"
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
      <div class="absolute z-20 left-0 right-0 top-0 mt-0.5 bg-prado-bg border border-prado-border rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
        <button
          v-for="(m, i) in suggestions"
          :key="i"
          type="button"
          class="w-full text-left px-3 py-2.5 hover:bg-prado-surface-hover transition-colors border-b border-prado-border last:border-0"
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

    <!-- Selected medecin card -->
    <div
      v-if="selected && model.nom"
      class="bg-prado-bg rounded-xl p-3 border border-prado-border"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-prado-text">{{ model.nom }}</p>
          <p v-if="model.specialite" class="text-xs text-[#004657]">{{ model.specialite }}</p>
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

    <!-- Manual input fallback -->
    <div v-if="!selected" class="text-[10px] text-prado-text-faint">
      Recherchez dans l'Annuaire Sante ou
      <button
        type="button"
        class="text-[#004657] hover:underline"
        @click="() => { model = { nom: query || 'Saisie manuelle', telephone: '', adresse: '', codePostal: '', specialite: '' }; selected = true }"
      >
        saisissez manuellement
      </button>
    </div>
  </div>
</template>
