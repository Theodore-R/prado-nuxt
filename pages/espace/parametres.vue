<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'espace', middleware: 'auth' })

const { loading } = useAuth()
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-32">
    <Loader2 class="animate-spin text-prado-text-muted" :size="32" />
  </div>

  <div v-else class="max-w-3xl mx-auto space-y-8">
    <h1 class="text-xl font-semibold text-prado-text italic">Parametres</h1>

    <EspaceSettingsProfile />
    <EspaceSettingsSecurity />
    <EspaceSettingsNotifications />
    <EspaceSettingsAccount />
  </div>
</template>
