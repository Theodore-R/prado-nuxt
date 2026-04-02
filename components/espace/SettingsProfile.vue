<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { STRUCTURES_PARTENAIRES } from '~/constants/structures'

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

const { user, updateProfile } = useAuth()
const supabaseUser = useSupabaseUser()

const form = ref({
  firstName: '',
  lastName: '',
  structure: '',
  fonction: '',
  phone: '',
})
const structureLibre = ref('')
const saving = ref(false)

watch(user, (u) => {
  if (u) {
    // Split name into first/last
    const parts = (u.name ?? '').split(' ')
    form.value.firstName = parts[0] ?? ''
    form.value.lastName = parts.slice(1).join(' ') ?? ''
    form.value.phone = supabaseUser.value?.user_metadata?.phone ?? ''
    form.value.fonction = supabaseUser.value?.user_metadata?.fonction ?? ''
    // Si la structure n'est pas dans la liste, c'est une saisie libre
    const struct = u.structure ?? ''
    if (STRUCTURES_PARTENAIRES.includes(struct)) {
      form.value.structure = struct
    } else if (struct) {
      form.value.structure = '__autre'
      structureLibre.value = struct
    }
  }
}, { immediate: true })

const client = useSupabaseClient()

async function handleSave() {
  const structure = form.value.structure === '__autre' ? structureLibre.value : form.value.structure
  if (!form.value.firstName || !form.value.lastName || !structure) {
    toast.error('Prénom, nom et structure sont requis')
    return
  }
  saving.value = true
  const result = await updateProfile({
    name: `${form.value.firstName} ${form.value.lastName}`,
    structure_id: structure,
    fonction: form.value.fonction,
    phone: form.value.phone,
  })
  await client.auth.refreshSession()
  saving.value = false
  if (result.error) {
    toast.error(result.error)
    return
  }
  toast.success('Profil mis a jour')
}

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <div class="bg-prado-surface rounded-2xl border border-prado-border p-6">
    <h2 class="text-sm font-semibold text-prado-text mb-4">Informations personnelles</h2>
    <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="handleSave">
      <div>
        <label class="text-xs text-prado-text-muted mb-1.5 block">Prénom *</label>
        <input v-model="form.firstName" type="text" autocomplete="given-name" required :class="inputClass" />
      </div>
      <div>
        <label class="text-xs text-prado-text-muted mb-1.5 block">Nom *</label>
        <input v-model="form.lastName" type="text" autocomplete="family-name" required :class="inputClass" />
      </div>
      <div>
        <label class="text-xs text-prado-text-muted mb-1.5 block">Email</label>
        <input :value="user?.email" type="email" disabled :class="inputClass" class="opacity-60 cursor-not-allowed" />
      </div>
      <div>
        <label class="text-xs text-prado-text-muted mb-1.5 block">Telephone</label>
        <input v-model="form.phone" type="tel" autocomplete="tel" :class="inputClass" />
      </div>
      <div>
        <label class="text-xs text-prado-text-muted mb-1.5 block">Structure *</label>
        <select v-model="form.structure" required :class="inputClass">
          <option value="" disabled>Sélectionner votre structure</option>
          <option v-for="s in STRUCTURES_PARTENAIRES" :key="s" :value="s">{{ s }}</option>
          <option value="__autre">Autre (saisie libre)</option>
        </select>
        <input
          v-if="form.structure === '__autre'"
          v-model="structureLibre"
          type="text"
          required
          placeholder="Nom de votre structure..."
          :class="inputClass"
          class="mt-2"
        />
      </div>
      <div>
        <label class="text-xs text-prado-text-muted mb-1.5 block">Fonction</label>
        <select v-model="form.fonction" :class="inputClass">
          <option value="">Sélectionner votre fonction</option>
          <option v-for="f in FONCTIONS" :key="f" :value="f">{{ f }}</option>
        </select>
      </div>
      <div class="sm:col-span-2">
        <button
          type="submit"
          :disabled="saving"
          class="px-5 py-2 rounded-full bg-prado-teal text-white text-sm disabled:opacity-50 flex items-center gap-2"
        >
          <Loader2 v-if="saving" :size="14" class="animate-spin" />
          Enregistrer les modifications
        </button>
      </div>
    </form>
  </div>
</template>
