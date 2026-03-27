<script setup lang="ts">
import { UserPlus, Trash2, Eye, Download, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { exportToCsv } from '~/utils/csvExport'
import { SITUATIONS, TYPES_HANDICAP, MESURES_PROTECTION, REGIMES_ALIMENTAIRES, LIEUX_HEBERGEMENT, DROITS_PARENTAUX_OPTIONS } from '~/lib/types/sante'
import type { JeuneSante } from '~/lib/types/sante'
import type { AdminTableColumn } from '~/components/admin/AdminTable.vue'

definePageMeta({ layout: 'espace', middleware: 'auth' })

const route = useRoute()
const { user, jeunes, jeunesLoading, inscriptions, addJeune, removeJeune } = useAuth()
const { confirm } = useConfirm()
const { complete } = useOnboarding()

const isRestricted = computed(() =>
  user.value?.status === 'pending' || user.value?.status === 'rejected',
)

const hasJeunes = computed(() => jeunes.value.length > 0)
const showAdd = ref(route.query.add === '1' || !hasJeunes.value)

// Keep form open when there are no jeunes
watch(hasJeunes, (has) => {
  if (!has) showAdd.value = true
})

const submitting = ref(false)
const newJeune = ref({
  firstName: '', lastName: '', dateOfBirth: '', address: '', postalCode: '', city: '', situation: '',
})

const columns: AdminTableColumn[] = [
  { key: 'name', label: 'Nom complet', sortable: true },
  { key: 'dateOfBirth', label: 'Date de naissance', sortable: true, hiddenBelow: 'sm' },
  { key: 'situation', label: 'Situation', sortable: true, hiddenBelow: 'md' },
  { key: 'inscriptionsCount', label: 'Inscriptions', sortable: true, hiddenBelow: 'lg' },
]

function situationLabel(val: string) {
  const found = SITUATIONS.find(s => s.value === val)
  return found ? found.label : val
}

const rows = computed(() =>
  jeunes.value.map(j => ({
    id: j.id,
    name: `${j.firstName} ${j.lastName}`,
    dateOfBirth: new Date(j.dateOfBirth).toLocaleDateString('fr-FR'),
    dateOfBirthRaw: j.dateOfBirth,
    situation: situationLabel(j.situation),
    inscriptionsCount: inscriptions.value.filter(i => i.jeuneId === j.id).length,
  })),
)

async function handleAdd() {
  submitting.value = true
  try {
    await addJeune(newJeune.value)
    complete('firstJeuneAdded')
    newJeune.value = { firstName: '', lastName: '', dateOfBirth: '', address: '', postalCode: '', city: '', situation: '' }
    showAdd.value = false
    toast.success('Fiche jeune creee')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur lors de la creation')
  } finally {
    submitting.value = false
  }
}

async function handleRemove(id: string, name: string) {
  const ok = await confirm(`Supprimer la fiche de ${name} ? Les inscriptions associees seront aussi supprimees.`, { variant: 'danger' })
  if (!ok) return
  try {
    await removeJeune(id)
    toast.info('Fiche supprimee')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur')
  }
}

const exporting = ref(false)

function labelFromOptions(options: readonly { value: string; label: string }[], val: string): string {
  return options.find(o => o.value === val)?.label ?? val
}

function labelsFromOptions(options: readonly { value: string; label: string }[], vals: string[]): string {
  return vals.map(v => labelFromOptions(options, v)).join(', ')
}

async function handleExport() {
  exporting.value = true
  try {
    // Fetch all sante data for enriched export
    const santeMap = await $fetch<Record<string, JeuneSante>>('/api/jeunes/sante-export')

    exportToCsv(
      'jeunes.csv',
      [
        'Nom', 'Date de naissance', 'Adresse', 'Code postal', 'Ville', 'Situation',
        'Allergies', 'Handicap', 'Taux invalidite', 'Regime alimentaire',
        'Medecin traitant', 'Traitements en cours',
        'Suivi medical', 'Suivi psychologique',
        'Contacts urgence',
        'Mesure de protection', 'Lieu hebergement', 'Referent ASE',
        'Droits parentaux', 'Composition familiale',
      ],
      jeunes.value.map(j => {
        const s = santeMap[j.id]
        const droitsType = s?.droitsParentaux?.split('|')[0] ?? ''
        const droitsDetail = s?.droitsParentaux?.split('|').slice(1).join('|') ?? ''

        return [
          `${j.firstName} ${j.lastName}`,
          new Date(j.dateOfBirth).toLocaleDateString('fr-FR'),
          j.address,
          j.postalCode,
          j.city,
          situationLabel(j.situation),
          // Sante
          s?.allergies?.join(', ') ?? '',
          s ? labelFromOptions([...TYPES_HANDICAP], s.handicap) : '',
          s?.tauxInvalidite ?? '',
          s ? labelsFromOptions([...REGIMES_ALIMENTAIRES], s.regimeAlimentaire) : '',
          s?.medecinTraitant ? `${s.medecinTraitant.nom}${s.medecinTraitant.telephone ? ' (' + s.medecinTraitant.telephone + ')' : ''}` : '',
          s?.traitementsEnCours?.join(', ') ?? '',
          s?.suiviMedical?.map(sm => `${sm.specialite} - ${sm.frequence}${sm.details ? ' (' + sm.details + ')' : ''}`).join('; ') ?? '',
          s?.suiviPsychologique?.enCours
            ? `Oui - ${s.suiviPsychologique.type} ${s.suiviPsychologique.frequence}${s.suiviPsychologique.notes ? ' (' + s.suiviPsychologique.notes + ')' : ''}`
            : 'Non',
          s?.contactsUrgence?.map(c => `${c.nom} (${c.lien}) ${c.telephone}`).join('; ') ?? '',
          // Famille
          s ? labelsFromOptions([...MESURES_PROTECTION], s.mesureProtection) : '',
          s ? labelFromOptions([...LIEUX_HEBERGEMENT], s.lieuHebergement) : '',
          s?.referentAse ? `${s.referentAse.nom}${s.referentAse.fonction ? ' - ' + s.referentAse.fonction : ''}${s.referentAse.telephone ? ' (' + s.referentAse.telephone + ')' : ''}` : '',
          droitsType ? `${labelFromOptions([...DROITS_PARENTAUX_OPTIONS], droitsType)}${droitsDetail ? ' - ' + droitsDetail : ''}` : '',
          s?.compositionFamiliale?.map(m => `${m.lien}: ${m.prenom}${m.age ? ' (' + m.age + ' ans)' : ''}${m.vitAvec ? ' [vit avec]' : ''}`).join('; ') ?? '',
        ]
      }),
    )
  } catch {
    toast.error('Erreur lors de l\'export')
  } finally {
    exporting.value = false
  }
}

function rowLink(row: Record<string, any>) {
  return `/espace/jeunes/${row.id}`
}

const addFormFields = [
  { label: 'Prenom', key: 'firstName', type: 'text' },
  { label: 'Nom', key: 'lastName', type: 'text' },
]

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-prado-text italic">Mes jeunes</h1>
      <button
        v-if="hasJeunes"
        :disabled="isRestricted"
        class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#004657] text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        @click="showAdd = !showAdd"
      >
        <UserPlus :size="14" /> Ajouter
      </button>
    </div>

    <!-- Empty state message when no jeunes -->
    <div v-if="!hasJeunes && !jeunesLoading" class="text-center py-4">
      <p class="text-prado-text-secondary mb-1">Vous n'avez pas encore de jeune enregistré.</p>
      <p class="text-sm text-prado-text-muted">Commencez par créer une fiche ci-dessous.</p>
    </div>

    <!-- Add jeune form -->
    <form
      v-if="showAdd"
      class="bg-prado-surface border border-prado-border rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
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
        <label class="text-xs text-prado-text-muted mb-1 block">Date de naissance</label>
        <UiDateOfBirthPicker v-model="newJeune.dateOfBirth" />
      </div>
      <div class="sm:col-span-2">
        <UiAddressAutocomplete
          v-model:address="newJeune.address"
          v-model:postal-code="newJeune.postalCode"
          v-model:city="newJeune.city"
        />
      </div>
      <div class="sm:col-span-2">
        <label class="text-xs text-prado-text-muted mb-1 block">Situation</label>
        <select v-model="newJeune.situation" required :class="inputClass">
          <option value="" disabled>-- Selectionnez une situation --</option>
          <option v-for="s in SITUATIONS.filter(s => s.value)" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
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
          v-if="hasJeunes"
          type="button"
          class="px-5 py-2 rounded-full bg-prado-tag-bg text-prado-text-muted text-sm"
          @click="showAdd = false"
        >
          Annuler
        </button>
      </div>
    </form>

    <!-- Table (only shown when there are jeunes) -->
    <AdminTable
      v-if="hasJeunes"
      :columns="columns"
      :rows="rows"
      :loading="jeunesLoading"
      :row-link="rowLink"
      search-placeholder="Rechercher un jeune..."
      empty-message="Aucun jeune enregistre"
    >
      <template #header-actions>
        <button
          v-if="rows.length > 0"
          :disabled="exporting"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-prado-border text-sm text-prado-text-secondary hover:bg-prado-surface-hover transition-colors disabled:opacity-50"
          @click="handleExport"
        >
          <Loader2 v-if="exporting" :size="14" class="animate-spin" />
          <Download v-else :size="14" />
          {{ exporting ? 'Export...' : 'CSV complet' }}
        </button>
      </template>

      <template #actions="{ row }">
        <NuxtLink
          :to="`/espace/jeunes/${row.id}`"
          class="p-1.5 rounded-lg hover:bg-prado-surface-hover text-prado-text-muted hover:text-[#004657] transition-colors"
          title="Voir la fiche"
        >
          <Eye :size="15" />
        </NuxtLink>
        <button
          class="p-1.5 rounded-lg hover:bg-red-500/10 text-prado-text-muted hover:text-red-400 transition-colors"
          title="Supprimer"
          @click.stop="handleRemove(row.id, row.name)"
        >
          <Trash2 :size="15" />
        </button>
      </template>
    </AdminTable>
  </div>
</template>
