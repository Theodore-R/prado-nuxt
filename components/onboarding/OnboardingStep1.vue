<script setup lang="ts">
import { Loader2, Mail, Lock, Shield } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  initialEmail?: string
}>()

const emit = defineEmits<{
  magicLinkSent: [email: string]
  switchToPassword: []
}>()

const { sendMagicLink } = useAuth()

const email = ref(props.initialEmail ?? '')
const submitting = ref(false)
const usePassword = ref(false)

async function handleMagicLink() {
  if (!email.value) return
  submitting.value = true
  const result = await sendMagicLink(email.value)
  submitting.value = false
  if (result.error) {
    toast.error(result.error)
    return
  }
  emit('magicLinkSent', email.value)
}

function switchToPassword() {
  emit('switchToPassword')
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl md:text-3xl text-prado-text mb-3">
        Rejoindre Prado Itinéraires
      </h1>
      <p class="text-prado-text-secondary">
        Créez votre espace professionnel en quelques secondes.
      </p>
    </div>

    <!-- Email form -->
    <form class="space-y-4" @submit.prevent="handleMagicLink">
      <div>
        <label class="text-sm text-prado-text-secondary mb-1.5 block">Email professionnel</label>
        <div class="relative">
          <Mail :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-prado-text-muted" />
          <input
            v-model="email"
            type="email"
            required
            placeholder="votre@email-pro.fr"
            class="w-full pl-10 pr-4 py-3 rounded-xl bg-prado-surface border border-prado-border text-prado-text placeholder:text-prado-text-faint focus:outline-none focus:border-prado-sage/50 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        :disabled="submitting || !email"
        class="w-full py-3 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] hover:bg-[var(--prado-signature)]/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
      >
        <Loader2 v-if="submitting" :size="16" class="animate-spin" />
        <template v-else>
          <Mail :size="16" />
          Recevoir un lien de connexion
        </template>
      </button>
    </form>

    <!-- Alternative: password -->
    <div class="text-center">
      <button
        type="button"
        class="text-sm text-prado-text-muted hover:text-prado-text transition-colors"
        @click="switchToPassword"
      >
        <Lock :size="12" class="inline mr-1" />
        Préférer un mot de passe classique
      </button>
    </div>

    <!-- Trust signals -->
    <div class="pt-4 border-t border-prado-border">
      <div class="flex items-center justify-center gap-2 text-xs text-prado-text-muted mb-4">
        <Shield :size="14" class="text-prado-sage" />
        <span>Données sécurisées et conformes au RGPD</span>
      </div>
      <p class="text-xs text-prado-text-faint text-center">
        100% gratuit · Sans engagement · Réservé aux professionnels de l'accompagnement
      </p>

      <!-- Partner logos -->
      <div class="flex items-center justify-center gap-6 mt-6 opacity-40">
        <img src="/images/partenaires/fondation-du-prado.png" alt="Fondation du Prado" class="h-8 w-auto object-contain brightness-0 invert" />
        <img src="/images/partenaires/metropole-de-lyon.png" alt="Métropole de Lyon" class="h-8 w-auto object-contain brightness-0 invert" />
        <img src="/images/partenaires/departement-du-rhone.png" alt="Département du Rhône" class="h-8 w-auto object-contain brightness-0 invert" />
      </div>
    </div>
  </div>
</template>
