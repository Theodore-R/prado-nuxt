<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

const { get, save, saving } = useAdminSettings()

interface ContactSettings {
  contactEmail: string
  contactPhone: string
  address: string
  donationUrl: string
}

const form = reactive<ContactSettings>({
  contactEmail: '',
  contactPhone: '',
  address: '',
  donationUrl: '',
})

watchEffect(() => {
  const s = get<ContactSettings>('contact')
  form.contactEmail = s.contactEmail ?? ''
  form.contactPhone = s.contactPhone ?? ''
  form.address = s.address ?? ''
  form.donationUrl = s.donationUrl ?? 'https://www.le-prado.fr/don/'
})

async function handleSave() {
  await save('contact', { ...form })
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm placeholder:text-prado-text-faint focus:outline-none focus:border-prado-sage/50 transition-colors'
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-lg font-semibold text-prado-text mb-1">Informations de contact</h2>
      <p class="text-sm text-prado-text-muted">Ces informations sont affichées sur la page Contact et dans le pied de page.</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm text-prado-text-muted mb-1.5">Email de contact</label>
        <input v-model="form.contactEmail" type="email" :class="inputClass" placeholder="itineraires@le-prado.fr" />
      </div>
      <div>
        <label class="block text-sm text-prado-text-muted mb-1.5">Téléphone</label>
        <input v-model="form.contactPhone" type="tel" :class="inputClass" placeholder="04 72 XX XX XX" />
      </div>
      <div>
        <label class="block text-sm text-prado-text-muted mb-1.5">Adresse</label>
        <input v-model="form.address" :class="inputClass" placeholder="Lyon 7e, France" />
      </div>
      <div>
        <label class="block text-sm text-prado-text-muted mb-1.5">Lien « Faire un don »</label>
        <input v-model="form.donationUrl" type="url" :class="inputClass" placeholder="https://www.le-prado.fr/don/" />
        <p class="text-[10px] text-prado-text-faint mt-1">URL du bouton "Faire un don" dans la navigation et le pied de page</p>
      </div>
    </div>

    <!-- Save -->
    <div class="pt-2">
      <button
        :disabled="saving"
        class="px-5 py-2.5 rounded-xl bg-prado-signature text-prado-signature-text text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        @click="handleSave"
      >
        <Loader2 v-if="saving" :size="14" class="animate-spin inline mr-1.5" />
        Enregistrer
      </button>
    </div>
  </div>
</template>
