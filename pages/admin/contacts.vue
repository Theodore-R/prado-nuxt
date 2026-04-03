<script setup lang="ts">
import { Download, Mail, CheckCircle, Circle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { exportToCsv } from '~/utils/csvExport'
import type { PrDataTableColumn } from '@theodoreriant/prado-ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface ContactMessage {
  id: string; created_at: string; name: string; email: string;
  subject: string; message: string; is_read: boolean;
}

const contacts = ref<ContactMessage[]>([])
const loading = ref(true)
const expandedId = ref<string | null>(null)

const columns: PrDataTableColumn[] = [
  { key: 'is_read', label: '', sortable: false },
  { key: 'created_at', label: 'Date', sortable: true },
  { key: 'name', label: 'Auteur', sortable: true },
  { key: 'subject', label: 'Sujet', sortable: true },
]

onMounted(async () => {
  try {
    contacts.value = await $fetch<ContactMessage[]>('/api/admin/contacts')
  } catch { toast.error('Erreur chargement contacts') }
  finally { loading.value = false }
})

async function toggleRead(msg: ContactMessage) {
  try {
    await $fetch('/api/admin/contacts', { method: 'PATCH', body: { id: msg.id, is_read: !msg.is_read } })
    contacts.value = contacts.value.map(c =>
      c.id === msg.id ? { ...c, is_read: !c.is_read } : c
    )
  } catch { toast.error('Erreur') }
}

function handleExport() {
  const headers = ['Date', 'Nom', 'Email', 'Sujet', 'Message', 'Lu']
  const rows = contacts.value.map(c => [
    new Date(c.created_at).toLocaleDateString('fr-FR'),
    c.name,
    c.email,
    c.subject,
    c.message,
    c.is_read ? 'Oui' : 'Non',
  ])
  exportToCsv('contacts.csv', headers, rows)
  toast.success('Export CSV telecharge')
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-prado-text italic">Messages de contact ({{ contacts.length }})</h1>
      <button
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-prado-teal text-white text-sm hover:opacity-90 transition-opacity"
        @click="handleExport"
      >
        <Download :size="16" />
        Exporter CSV
      </button>
    </div>

    <!-- Custom table with expand support (can't fully use PrDataTable due to expand row) -->
    <div class="space-y-4">
      <div class="bg-prado-surface rounded-2xl border border-prado-border overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-prado-border text-prado-text-secondary">
              <th class="text-left px-4 py-3 font-medium w-10" />
              <th class="text-left px-4 py-3 font-medium">Date</th>
              <th class="text-left px-4 py-3 font-medium">Auteur</th>
              <th class="text-left px-4 py-3 font-medium">Sujet</th>
              <th class="text-left px-4 py-3 font-medium w-20" />
            </tr>
          </thead>
          <tbody v-if="loading">
            <tr v-for="n in 5" :key="n" class="border-b border-prado-border last:border-0">
              <td class="px-4 py-3"><div class="h-2 w-2 bg-prado-border/50 rounded-full animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-4 bg-prado-border/50 rounded animate-pulse w-20" /></td>
              <td class="px-4 py-3"><div class="h-4 bg-prado-border/50 rounded animate-pulse w-32" /></td>
              <td class="px-4 py-3"><div class="h-4 bg-prado-border/50 rounded animate-pulse w-40" /></td>
              <td class="px-4 py-3"><div class="h-4 bg-prado-border/50 rounded animate-pulse w-8 ml-auto" /></td>
            </tr>
          </tbody>
          <tbody v-else>
            <template v-for="msg in contacts" :key="msg.id">
              <tr
                class="border-b border-prado-border last:border-0 hover:bg-prado-surface-hover cursor-pointer"
                :class="{ 'font-medium': !msg.is_read }"
                @click="expandedId = expandedId === msg.id ? null : msg.id"
              >
                <td class="px-4 py-3"><div class="w-2 h-2 rounded-full" :class="msg.is_read ? 'bg-transparent' : 'bg-prado-sage'" /></td>
                <td class="px-4 py-3 text-prado-text-muted">{{ new Date(msg.created_at).toLocaleDateString('fr-FR') }}</td>
                <td class="px-4 py-3 text-prado-text">{{ msg.name }} <br><span class="text-xs text-prado-text-faint">{{ msg.email }}</span></td>
                <td class="px-4 py-3 text-prado-text">{{ msg.subject }}</td>
                <td class="px-4 py-3">
                  <button @click.stop="toggleRead(msg)" class="p-2 hover:text-[#93C1AF]">
                    <CheckCircle v-if="msg.is_read" :size="18" class="text-[#93C1AF]" />
                    <Circle v-else :size="18" class="text-prado-text-muted" />
                  </button>
                </td>
              </tr>
              <tr v-if="expandedId === msg.id" class="bg-prado-bg-deep/30 border-b border-prado-border">
                <td colspan="5" class="px-6 py-4">
                  <div class="p-4 rounded-xl bg-prado-surface border border-prado-border text-prado-text text-sm whitespace-pre-wrap">{{ msg.message }}</div>
                  <a :href="`mailto:${msg.email}`" class="inline-flex items-center gap-2 mt-3 text-xs text-prado-sage hover:underline"><Mail :size="12" /> Repondre</a>
                </td>
              </tr>
            </template>
            <tr v-if="contacts.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-prado-text-muted">Aucun message</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
