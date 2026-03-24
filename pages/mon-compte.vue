<script setup lang="ts">
import { UserPlus, Trash2, Calendar, User, LogOut, Key, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({ middleware: 'auth' })

const { client: prismic } = usePrismic()
const {
  user, loading, logout, updatePassword,
  jeunes, jeunesLoading, addJeune, removeJeune,
  inscriptions, desinscrire,
} = useAuth()

const showAdd = ref(false)
const showPassword = ref(false)
const newJeune = ref({
  firstName: '', lastName: '', dateOfBirth: '', address: '', situation: '',
})
const newPassword = ref('')
const confirmPassword = ref('')
const submitting = ref(false)

const { data: prismicActions } = await useAsyncData('mon-compte-actions', () =>
  prismic.getAllByType('action')
)

const actions = computed(() =>
  (prismicActions.value ?? []).map(doc => ({
    id: doc.data.original_id as number,
    title: doc.data.title as string,
  }))
)

const isPending = computed(() => user.value?.status === 'pending')
const isRejected = computed(() => user.value?.status === 'rejected')
const isRestricted = computed(() => isPending.value || isRejected.value)

async function handleAdd() {
  submitting.value = true
  try {
    await addJeune(newJeune.value)
    newJeune.value = { firstName: '', lastName: '', dateOfBirth: '', address: '', situation: '' }
    showAdd.value = false
    toast.success('Fiche jeune creee')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur lors de la creation')
  } finally {
    submitting.value = false
  }
}

async function handleRemove(id: string) {
  try {
    await removeJeune(id)
    toast.info('Fiche supprimee')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression')
  }
}

async function handleDesinscrire(id: string) {
  try {
    await desinscrire(id)
    toast.info('Inscription annulee')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur')
  }
}

async function handlePasswordChange() {
  if (newPassword.value !== confirmPassword.value) {
    toast.error('Les mots de passe ne correspondent pas')
    return
  }
  if (newPassword.value.length < 6) {
    toast.error('Le mot de passe doit contenir au moins 6 caracteres')
    return
  }
  submitting.value = true
  const result = await updatePassword(newPassword.value)
  submitting.value = false
  if (result.error) {
    toast.error(result.error)
    return
  }
  toast.success('Mot de passe modifie !')
  showPassword.value = false
  newPassword.value = ''
  confirmPassword.value = ''
}

const addFormFields = [
  { label: 'Prenom', key: 'firstName', type: 'text' },
  { label: 'Nom', key: 'lastName', type: 'text' },
  { label: 'Date de naissance', key: 'dateOfBirth', type: 'date' },
  { label: 'Adresse', key: 'address', type: 'text' },
]

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-32">
    <Loader2 class="animate-spin text-prado-text-muted" :size="32" />
  </div>

  <div v-else-if="!user" class="flex items-center justify-center py-32">
    <p class="text-prado-text-muted">Redirection...</p>
  </div>

  <div v-else class="max-w-5xl mx-auto px-6 py-12">
    <!-- Profile header -->
    <div class="bg-prado-surface rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-prado-border">
      <div class="w-14 h-14 rounded-full bg-gradient-to-br from-[#CF006C] to-[#FB6223] flex items-center justify-center text-white">
        <User :size="24" />
      </div>
      <div class="flex-1">
        <h1 class="text-2xl text-prado-text italic" :style="{ fontFamily: 'Poppins' }">
          {{ user.name }}
        </h1>
        <p class="text-sm text-prado-text-muted">
          {{ user.email }} -- {{ user.structure }}
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-prado-tag-bg text-prado-text-muted text-sm hover:bg-prado-border transition-colors"
          @click="showPassword = !showPassword"
        >
          <Key :size="13" /> Mot de passe
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-prado-tag-bg text-red-400 text-sm hover:bg-red-500/10 transition-colors"
          @click="logout()"
        >
          <LogOut :size="13" /> Deconnexion
        </button>
      </div>
    </div>

    <!-- Password change form -->
    <form
      v-if="showPassword"
      class="bg-prado-surface border border-prado-border rounded-2xl p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
      @submit.prevent="handlePasswordChange"
    >
      <div>
        <label class="text-xs text-prado-text-muted mb-1 block">Nouveau mot de passe</label>
        <input v-model="newPassword" type="password" required :class="inputClass" />
      </div>
      <div>
        <label class="text-xs text-prado-text-muted mb-1 block">Confirmer</label>
        <input v-model="confirmPassword" type="password" required :class="inputClass" />
      </div>
      <div class="sm:col-span-2 flex gap-2">
        <button
          type="submit"
          :disabled="submitting"
          class="px-5 py-2 rounded-full bg-[#CF006C] text-white text-sm disabled:opacity-50 flex items-center gap-2"
        >
          <Loader2 v-if="submitting" :size="14" class="animate-spin" />
          Modifier
        </button>
        <button
          type="button"
          class="px-5 py-2 rounded-full bg-prado-tag-bg text-prado-text-muted text-sm"
          @click="showPassword = false"
        >
          Annuler
        </button>
      </div>
    </form>

    <!-- Status banners -->
    <div v-if="isPending" class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 text-sm text-amber-600">
      Votre compte est en attente de validation par l'association. Vous pourrez gerer vos fiches jeunes une fois votre compte approuve.
    </div>
    <div v-if="isRejected" class="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-sm text-red-400">
      Votre demande de compte a ete refusee. Contactez l'association pour plus d'informations.
    </div>

    <!-- Jeunes section -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl text-prado-text">Mes fiches jeunes ({{ jeunes.length }})</h2>
      <button
        :disabled="isRestricted"
        class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#CF006C] text-white text-sm hover:bg-[#a80057] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        @click="showAdd = !showAdd"
      >
        <UserPlus :size="14" /> Ajouter
      </button>
    </div>

    <!-- Add jeune form -->
    <form
      v-if="showAdd"
      class="bg-prado-surface border border-prado-border rounded-2xl p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
      @submit.prevent="handleAdd"
    >
      <div v-for="f in addFormFields" :key="f.key">
        <label class="text-xs text-prado-text-muted mb-1 block">{{ f.label }}</label>
        <input
          :type="f.type"
          :value="(newJeune as Record<string, string>)[f.key]"
          required
          :class="inputClass"
          @input="(newJeune as Record<string, string>)[f.key] = ($event.target as HTMLInputElement).value"
        />
      </div>
      <div class="sm:col-span-2">
        <label class="text-xs text-prado-text-muted mb-1 block">Situation globale</label>
        <input
          v-model="newJeune.situation"
          required
          :class="inputClass"
          placeholder="Ex: Protection de l'enfance"
        />
      </div>
      <div class="sm:col-span-2 flex gap-2">
        <button
          type="submit"
          :disabled="submitting"
          class="px-5 py-2 rounded-full bg-[#93C1AF] text-white text-sm disabled:opacity-50 flex items-center gap-2"
        >
          <Loader2 v-if="submitting" :size="14" class="animate-spin" />
          Enregistrer
        </button>
        <button
          type="button"
          class="px-5 py-2 rounded-full bg-prado-tag-bg text-prado-text-muted text-sm"
          @click="showAdd = false"
        >
          Annuler
        </button>
      </div>
    </form>

    <!-- Jeunes list -->
    <div v-if="jeunesLoading" class="flex items-center justify-center py-12">
      <Loader2 class="animate-spin text-prado-text-muted" :size="24" />
    </div>
    <div v-else class="space-y-3">
      <p v-if="jeunes.length === 0" class="text-sm text-prado-text-faint text-center py-8">
        Aucune fiche jeune. Cliquez sur "Ajouter" pour creer votre premiere fiche.
      </p>
      <div v-for="j in jeunes" :key="j.id" class="bg-prado-surface border border-prado-border rounded-2xl p-5">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-prado-text">{{ j.firstName }} {{ j.lastName }}</h3>
            <p class="text-xs text-prado-text-faint mt-0.5">
              Ne(e) le {{ new Date(j.dateOfBirth).toLocaleDateString('fr-FR') }} -- {{ j.situation }}
            </p>
            <p class="text-xs text-prado-text-faint">{{ j.address }}</p>
          </div>
          <button
            class="p-2 rounded-xl hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-colors"
            @click="handleRemove(j.id)"
          >
            <Trash2 :size="15" />
          </button>
        </div>
        <div v-if="inscriptions.filter(i => i.jeuneId === j.id).length > 0" class="mt-4 pt-3 border-t border-prado-border">
          <p class="text-xs text-prado-text-faint mb-2 flex items-center gap-1">
            <Calendar :size="11" /> Inscriptions :
          </p>
          <div class="flex flex-wrap gap-2">
            <template v-for="insc in inscriptions.filter(i => i.jeuneId === j.id)" :key="insc.id">
              <div
                v-if="actions.find(a => String(a.id) === insc.actionId)"
                class="flex items-center gap-2 bg-prado-input-bg rounded-full px-3 py-1.5"
              >
                <NuxtLink
                  :to="`/actions/${actions.find(a => String(a.id) === insc.actionId)!.id}`"
                  class="text-xs text-prado-text-secondary hover:text-[#FB6223]"
                >
                  {{ actions.find(a => String(a.id) === insc.actionId)!.title }}
                </NuxtLink>
                <button
                  class="text-xs text-red-400/50 hover:text-red-400"
                  @click="handleDesinscrire(insc.id)"
                >
                  x
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
