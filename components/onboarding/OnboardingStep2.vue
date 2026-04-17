<script setup lang="ts">
import { Loader2, User, Building, Briefcase, Phone } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const emit = defineEmits<{
  completed: []
}>()

const props = defineProps<{
  email?: string
}>()

const { completeProfile } = useAuth()
const { complete } = usePradoOnboarding()

const form = ref({
  prenom: '',
  nom: '',
  fonction: '',
  structureId: '',
  phone: '',
})
const submitting = ref(false)

const FONCTIONS = [
  'Éducateur·rice spécialisé·e',
  'Référent·e ASE',
  'Référent·e PJJ',
  'Conseiller·e en insertion',
  'Chef·fe de service',
  'Travailleur·se social·e',
  'Coordinateur·rice',
  'Autre',
]

// Fetch structures from API
const structures = ref<{ id: string; name: string }[]>([])
onMounted(async () => {
  try {
    structures.value = await $fetch<{ id: string; name: string }[]>('/api/structures')
  } catch {
    toast.error('Erreur lors du chargement des structures')
  }
})

async function handleSubmit() {
  if (!form.value.prenom || !form.value.nom || !form.value.structureId) {
    toast.error('Veuillez remplir les champs obligatoires')
    return
  }
  submitting.value = true
  const result = await completeProfile({
    name: `${form.value.prenom} ${form.value.nom}`,
    structure_id: form.value.structureId,
    fonction: form.value.fonction,
    phone: form.value.phone,
  })
  submitting.value = false
  if (result.error) {
    toast.error(result.error)
    return
  }
  complete('accountCreated')
  complete('profileCompleted')
  toast.success('Profil complété !')
  emit('completed')
}

const inputClass = 'w-full pl-10 pr-4 py-3 rounded-xl bg-prado-surface border border-prado-border text-prado-text placeholder:text-prado-text-faint focus:outline-none focus:border-prado-sage/50 transition-colors'
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl md:text-3xl text-prado-text mb-3">
        Votre profil professionnel
      </h1>
      <p class="text-prado-text-secondary">
        Ces informations nous permettent de valider votre compte.
      </p>
    </div>

    <!-- Progress -->
    <OnboardingProgress :current="1" :total="3" />

    <!-- Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Prénom + Nom -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-sm text-prado-text-secondary mb-1.5 block">Prénom *</label>
          <div class="relative">
            <User :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-prado-text-muted" />
            <input
              v-model="form.prenom"
              type="text"
              required
              placeholder="Prénom"
              :class="inputClass"
            />
          </div>
        </div>
        <div>
          <label class="text-sm text-prado-text-secondary mb-1.5 block">Nom *</label>
          <input
            v-model="form.nom"
            type="text"
            required
            placeholder="Nom"
            class="w-full px-4 py-3 rounded-xl bg-prado-surface border border-prado-border text-prado-text placeholder:text-prado-text-faint focus:outline-none focus:border-prado-sage/50 transition-colors"
          />
        </div>
      </div>

      <!-- Fonction -->
      <div>
        <label class="text-sm text-prado-text-secondary mb-1.5 block">Fonction</label>
        <div class="relative">
          <Briefcase :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-prado-text-muted" />
          <select
            v-model="form.fonction"
            :class="inputClass"
          >
            <option value="" disabled>Sélectionner votre fonction</option>
            <option v-for="f in FONCTIONS" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
      </div>

      <!-- Structure (dropdown from API) -->
      <div>
        <label class="text-sm text-prado-text-secondary mb-1.5 block">Structure / Établissement *</label>
        <div class="relative">
          <Building :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-prado-text-muted" />
          <select
            v-model="form.structureId"
            required
            :class="inputClass"
          >
            <option value="" disabled>Sélectionner votre structure</option>
            <option v-for="s in structures" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <p class="text-xs text-prado-text-muted mt-1.5">
          Votre structure n'apparaît pas ? Contactez l'administrateur.
        </p>
      </div>

      <!-- Téléphone -->
      <div>
        <label class="text-sm text-prado-text-secondary mb-1.5 block">Téléphone <span class="text-prado-text-faint">(optionnel)</span></label>
        <div class="relative">
          <Phone :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-prado-text-muted" />
          <input
            v-model="form.phone"
            type="tel"
            placeholder="06 XX XX XX XX"
            :class="inputClass"
          />
        </div>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full py-3 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] hover:bg-[var(--prado-signature)]/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
      >
        <Loader2 v-if="submitting" :size="16" class="animate-spin" />
        Continuer
      </button>
    </form>

    <!-- Testimonial -->
    <div class="bg-prado-surface rounded-xl p-4 border border-prado-border">
      <p class="text-sm text-prado-text-secondary italic leading-relaxed">
        « La plateforme simplifie énormément les inscriptions. »
      </p>
      <p class="text-xs text-prado-text-muted mt-2">
        — Marie D., éducatrice spécialisée
      </p>
    </div>
  </div>
</template>
