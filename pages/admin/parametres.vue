<script setup lang="ts">
import { Mail, Newspaper, BarChart3, Phone, FileText } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const { fetchSettings, loading } = useAdminSettings()

const sections = [
  { key: 'email', label: 'Email & Notifications', icon: Mail },
  { key: 'newsletter', label: 'Newsletter & Mailchimp', icon: Newspaper },
  { key: 'prismic', label: 'CMS (Prismic)', icon: FileText },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'contact', label: 'Informations de contact', icon: Phone },
] as const

const activeSection = ref<string>('email')

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-prado-text italic mb-6">Paramètres</h1>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 4" :key="n" class="h-16 rounded-xl bg-prado-surface animate-pulse" />
    </div>

    <div v-else class="space-y-6">
      <!-- Tabs -->
      <div class="border-b border-prado-border overflow-x-auto">
        <nav class="flex gap-0 -mb-px">
          <button
            v-for="section in sections"
            :key="section.key"
            :class="[
              'flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors',
              activeSection === section.key
                ? 'border-prado-sage text-prado-text font-medium'
                : 'border-transparent text-prado-text-muted hover:text-prado-text hover:border-prado-border',
            ]"
            @click="activeSection = section.key"
          >
            <component :is="section.icon" :size="16" />
            {{ section.label }}
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="bg-prado-surface rounded-2xl border border-prado-border p-6">
        <AdminSettingsEmail v-if="activeSection === 'email'" />
        <AdminSettingsNewsletter v-else-if="activeSection === 'newsletter'" />
        <AdminSettingsPrismic v-else-if="activeSection === 'prismic'" />
        <AdminSettingsAnalytics v-else-if="activeSection === 'analytics'" />
        <AdminSettingsContact v-else-if="activeSection === 'contact'" />
      </div>
    </div>
  </div>
</template>
