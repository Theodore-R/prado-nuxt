<script setup lang="ts">
const props = defineProps<{
  address: string
  postalCode: string
  city: string
}>()

const emit = defineEmits<{
  'update:address': [value: string]
  'update:postalCode': [value: string]
  'update:city': [value: string]
}>()

interface Suggestion {
  label: string
  name: string
  postcode: string
  city: string
}

const query = ref(props.address)
const suggestions = ref<Suggestion[]>([])
const showSuggestions = ref(false)
const loading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.address, (val) => {
  if (val !== query.value) query.value = val
})

function handleInput(value: string) {
  query.value = value
  emit('update:address', value)

  if (debounceTimer) clearTimeout(debounceTimer)

  if (value.length < 3) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  debounceTimer = setTimeout(() => fetchSuggestions(value), 300)
}

async function fetchSuggestions(q: string) {
  loading.value = true
  try {
    const res = await $fetch<any>(`https://data.geopf.fr/geocodage/search/`, {
      params: { q, autocomplete: 1, limit: 5 },
    })
    suggestions.value = (res.features ?? []).map((f: any) => ({
      label: f.properties.label,
      name: f.properties.name,
      postcode: f.properties.postcode,
      city: f.properties.city,
    }))
    showSuggestions.value = suggestions.value.length > 0
  } catch {
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

function selectSuggestion(s: Suggestion) {
  query.value = s.name
  emit('update:address', s.name)
  emit('update:postalCode', s.postcode)
  emit('update:city', s.city)
  showSuggestions.value = false
}

function handleBlur() {
  // Delay to allow click on suggestion
  setTimeout(() => { showSuggestions.value = false }, 200)
}

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <div class="space-y-3">
    <!-- Adresse avec autocomplétion -->
    <div>
      <label class="text-xs text-prado-text-muted mb-1 block">Adresse</label>
      <div class="relative">
        <input
          :value="query"
          type="text"
          :class="inputClass"
          placeholder="Commencez à taper l'adresse..."
          autocomplete="off"
          @input="handleInput(($event.target as HTMLInputElement).value)"
          @focus="showSuggestions = suggestions.length > 0"
          @blur="handleBlur"
        />
        <!-- Suggestions dropdown -->
        <div
          v-if="showSuggestions"
          class="absolute z-20 left-0 right-0 top-full mt-1 bg-prado-bg border border-prado-border rounded-xl shadow-lg overflow-hidden"
        >
          <button
            v-for="(s, i) in suggestions"
            :key="i"
            type="button"
            class="w-full text-left px-3 py-2.5 text-sm text-prado-text hover:bg-prado-surface-hover transition-colors border-b border-prado-border last:border-0"
            @mousedown.prevent="selectSuggestion(s)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <!-- Code postal -->
      <div>
        <label class="text-xs text-prado-text-muted mb-1 block">Code postal</label>
        <input
          :value="postalCode"
          type="text"
          :class="inputClass"
          placeholder="69000"
          maxlength="5"
          @input="$emit('update:postalCode', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Ville -->
      <div>
        <label class="text-xs text-prado-text-muted mb-1 block">Ville</label>
        <input
          :value="city"
          type="text"
          :class="inputClass"
          placeholder="Lyon"
          @input="$emit('update:city', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
