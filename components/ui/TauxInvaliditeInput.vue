<script setup lang="ts">
const model = defineModel<string>({ required: true })

const STATUTS = [
  { value: 'non_concerne', label: 'Non concerné' },
  { value: 'en_cours', label: 'Dossier en cours' },
  { value: 'reconnu', label: 'Taux reconnu' },
  { value: 'renouvellement', label: 'En cours de renouvellement' },
] as const

// Parse the model: "reconnu:80" or "en_cours" or ""
const statut = ref('')
const taux = ref(50)

function parseModel(val: string) {
  if (!val) {
    statut.value = ''
    taux.value = 50
    return
  }
  if (val.includes(':')) {
    const [s, t] = val.split(':')
    statut.value = s
    taux.value = parseInt(t) || 50
  } else {
    statut.value = val
    taux.value = 50
  }
}

parseModel(model.value)

watch(model, (val) => parseModel(val))

function updateModel() {
  if (!statut.value) {
    model.value = ''
  } else if (statut.value === 'reconnu') {
    model.value = `reconnu:${taux.value}`
  } else {
    model.value = statut.value
  }
}

function setStatut(val: string) {
  statut.value = val
  updateModel()
}

function setTaux(val: number) {
  taux.value = val
  updateModel()
}

const tauxColor = computed(() => {
  if (taux.value < 50) return '#93C1AF' // vert
  if (taux.value < 80) return '#FB6223' // orange
  return '#CF006C' // rouge
})

const tauxLabel = computed(() => {
  if (taux.value < 50) return 'Taux léger'
  if (taux.value < 80) return 'Taux moyen (seuil AAH partielle)'
  return 'Taux lourd (seuil AAH + CMI)'
})
</script>

<template>
  <div class="space-y-3">
    <!-- Radio buttons -->
    <div class="space-y-2">
      <label
        v-for="s in STATUTS"
        :key="s.value"
        class="flex items-center gap-2.5 cursor-pointer group"
      >
        <span
          class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
          :class="statut === s.value
            ? 'border-prado-signature bg-prado-signature'
            : 'border-prado-border group-hover:border-prado-border-medium'"
        >
          <span v-if="statut === s.value" class="w-1.5 h-1.5 rounded-full bg-white" />
        </span>
        <span class="text-sm text-prado-text">{{ s.label }}</span>
        <input
          type="radio"
          :value="s.value"
          :checked="statut === s.value"
          class="sr-only"
          @change="setStatut(s.value)"
        />
      </label>
    </div>

    <!-- Slider (only visible when "reconnu") -->
    <div v-if="statut === 'reconnu'" class="bg-prado-bg rounded-xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm text-prado-text-muted">Taux d'invalidité</span>
        <span class="text-lg font-semibold" :style="{ color: tauxColor }">{{ taux }}%</span>
      </div>

      <!-- Slider -->
      <div class="relative">
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          :value="taux"
          class="w-full h-2 rounded-full appearance-none cursor-pointer slider-thumb"
          :style="{
            background: `linear-gradient(to right, ${tauxColor} ${taux}%, var(--prado-border) ${taux}%)`,
          }"
          @input="setTaux(parseInt(($event.target as HTMLInputElement).value))"
        />
        <!-- Markers at MDPH thresholds -->
        <div class="flex justify-between mt-1 px-0.5">
          <span class="text-[10px] text-prado-text-faint">0%</span>
          <span class="text-[10px] text-prado-text-faint" style="position: absolute; left: 50%">50%</span>
          <span class="text-[10px] text-prado-text-faint" style="position: absolute; left: 80%">80%</span>
          <span class="text-[10px] text-prado-text-faint">100%</span>
        </div>
      </div>

      <p class="text-xs" :style="{ color: tauxColor }">{{ tauxLabel }}</p>
    </div>
  </div>
</template>

<style scoped>
.slider-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 3px solid v-bind(tauxColor);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.slider-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 3px solid v-bind(tauxColor);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
