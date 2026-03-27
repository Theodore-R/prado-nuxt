<script setup lang="ts">
import { Loader2, Heart, Plus, Trash2, X, Pencil } from 'lucide-vue-next'
import {
  REGIMES_ALIMENTAIRES, TYPES_HANDICAP, ALLERGENES_COURANTS, MEDICAMENTS_COURANTS,
  SPECIALITES_MEDICALES, FREQUENCES_SUIVI, TYPES_SUIVI_PSY,
  emptySuiviMedicalEntry,
} from '~/lib/types/sante'
import type { JeuneSanteInput, SuiviMedicalEntry } from '~/lib/types/sante'

const props = defineProps<{
  saving: boolean
}>()

const emit = defineEmits<{
  save: []
}>()

const form = defineModel<JeuneSanteInput>({ required: true })

// Suivi médical — modal form
const showSuiviForm = ref(false)
const editingSuiviIndex = ref<number | null>(null)
const suiviDraft = ref<SuiviMedicalEntry>(emptySuiviMedicalEntry())

function openAddSuivi() {
  suiviDraft.value = emptySuiviMedicalEntry()
  editingSuiviIndex.value = null
  showSuiviForm.value = true
}

function openEditSuivi(index: number) {
  suiviDraft.value = { ...form.value.suiviMedical[index] }
  editingSuiviIndex.value = index
  showSuiviForm.value = true
}

function saveSuiviDraft() {
  if (!suiviDraft.value.specialite) return
  if (editingSuiviIndex.value !== null) {
    form.value = {
      ...form.value,
      suiviMedical: form.value.suiviMedical.map((s, i) =>
        i === editingSuiviIndex.value ? { ...suiviDraft.value } : s,
      ),
    }
  } else {
    form.value = {
      ...form.value,
      suiviMedical: [...form.value.suiviMedical, { ...suiviDraft.value }],
    }
  }
  showSuiviForm.value = false
}

function removeSuivi(index: number) {
  form.value = {
    ...form.value,
    suiviMedical: form.value.suiviMedical.filter((_, i) => i !== index),
  }
}

function specialiteLabel(val: string): string {
  return SPECIALITES_MEDICALES.find(s => s.value === val)?.label ?? val
}

function frequenceLabel(val: string): string {
  return FREQUENCES_SUIVI.find(f => f.value === val)?.label ?? val
}

// Suivi psychologique helpers
function toggleSuiviPsy(checked: boolean) {
  form.value = {
    ...form.value,
    suiviPsychologique: { ...form.value.suiviPsychologique, enCours: checked },
  }
}

function updateSuiviPsy(field: 'type' | 'frequence' | 'notes', value: string) {
  form.value = {
    ...form.value,
    suiviPsychologique: { ...form.value.suiviPsychologique, [field]: value },
  }
}

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
const labelClass = 'text-sm text-prado-text-muted mb-1 block'
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 mb-2">
      <Heart :size="16" class="text-[#CF006C]" />
      <h3 class="text-sm font-semibold text-prado-text">Informations de sante</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Allergies (TagInput) -->
      <div class="md:col-span-2">
        <label :class="labelClass">Allergies</label>
        <UiTagInput
          v-model="form.allergies"
          :suggestions="[...ALLERGENES_COURANTS]"
          placeholder="Tapez pour rechercher ou ajouter une allergie..."
        />
      </div>

      <!-- Handicap (Select MDPH) -->
      <div>
        <label :class="labelClass">Handicap</label>
        <select v-model="form.handicap" :class="inputClass">
          <option v-for="h in TYPES_HANDICAP" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>

      <!-- Taux d'invalidite (Radio + Slider) -->
      <div>
        <label :class="labelClass">Taux d'invalidite (MDPH)</label>
        <UiTauxInvaliditeInput v-model="form.tauxInvalidite" />
      </div>

      <!-- Regime alimentaire (MultiCheckbox) -->
      <div class="md:col-span-2">
        <label :class="labelClass">Regime alimentaire</label>
        <UiMultiCheckbox v-model="form.regimeAlimentaire" :options="REGIMES_ALIMENTAIRES" />
      </div>

      <!-- Medecin traitant (autocomplete Annuaire Santé) -->
      <div class="md:col-span-2">
        <label :class="labelClass">Medecin traitant</label>
        <UiMedecinAutocomplete v-model="form.medecinTraitant" />
      </div>

      <!-- Suivi medical (cards + modal form) -->
      <div class="md:col-span-2">
        <label :class="labelClass">Suivi medical</label>
        <div class="space-y-2">
          <!-- Existing entries as summary cards -->
          <div
            v-for="(suivi, index) in form.suiviMedical"
            :key="index"
            class="bg-prado-bg rounded-xl p-3 flex items-center gap-3"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-prado-text">{{ specialiteLabel(suivi.specialite) }}</p>
              <p class="text-xs text-prado-text-muted">
                <span v-if="suivi.frequence">{{ frequenceLabel(suivi.frequence) }}</span>
                <span v-if="suivi.frequence && suivi.details"> — </span>
                <span v-if="suivi.details">{{ suivi.details }}</span>
              </p>
            </div>
            <button
              class="p-1.5 rounded-lg hover:bg-prado-surface-hover text-prado-text-faint hover:text-prado-text-muted transition-colors"
              @click="openEditSuivi(index)"
            >
              <Pencil :size="13" />
            </button>
            <button
              class="p-1.5 rounded-lg hover:bg-red-500/10 text-prado-text-faint hover:text-red-400 transition-colors"
              @click="removeSuivi(index)"
            >
              <Trash2 :size="13" />
            </button>
          </div>

          <button
            class="inline-flex items-center gap-1.5 text-xs text-[#004657] hover:underline"
            @click="openAddSuivi"
          >
            <Plus :size="12" /> Ajouter un suivi
          </button>
        </div>

        <!-- Suivi form (modal-like overlay) -->
        <Teleport to="body">
          <div
            v-if="showSuiviForm"
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/50" @click="showSuiviForm = false" />

            <!-- Modal -->
            <div class="relative w-full max-w-lg rounded-2xl border border-prado-border p-6 space-y-4 shadow-2xl" style="background-color: var(--prado-surface);">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold text-prado-text">
                  {{ editingSuiviIndex !== null ? 'Modifier le suivi' : 'Ajouter un suivi medical' }}
                </h4>
                <button
                  class="p-1.5 rounded-lg hover:bg-prado-surface-hover text-prado-text-faint transition-colors"
                  @click="showSuiviForm = false"
                >
                  <X :size="16" />
                </button>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="text-xs text-prado-text-muted mb-1 block">Specialite *</label>
                  <select v-model="suiviDraft.specialite" :class="inputClass">
                    <option v-for="s in SPECIALITES_MEDICALES" :key="s.value" :value="s.value">{{ s.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs text-prado-text-muted mb-1 block">Frequence</label>
                  <select v-model="suiviDraft.frequence" :class="inputClass">
                    <option v-for="f in FREQUENCES_SUIVI" :key="f.value" :value="f.value">{{ f.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs text-prado-text-muted mb-1 block">Details (nom du praticien, lieu, notes...)</label>
                  <textarea
                    v-model="suiviDraft.details"
                    :class="inputClass"
                    rows="4"
                    placeholder="Dr. Martin — CMP Lyon 7e&#10;Suivi depuis septembre 2025&#10;Bilan tous les 3 mois..."
                  />
                </div>
              </div>

              <div class="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  class="px-4 py-2 rounded-lg text-sm text-prado-text-muted hover:bg-prado-surface-hover transition-colors"
                  @click="showSuiviForm = false"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  :disabled="!suiviDraft.specialite"
                  class="px-4 py-2 rounded-lg text-sm bg-[#004657] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  @click="saveSuiviDraft"
                >
                  {{ editingSuiviIndex !== null ? 'Modifier' : 'Ajouter' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>
      </div>

      <!-- Suivi psychologique (toggle + structured) -->
      <div class="md:col-span-2">
        <label :class="labelClass">Suivi psychologique</label>
        <div class="bg-prado-bg rounded-xl p-4 space-y-3">
          <!-- Toggle -->
          <label class="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="form.suiviPsychologique.enCours ? 'bg-[#004657]' : 'bg-prado-border'"
              @click="toggleSuiviPsy(!form.suiviPsychologique.enCours)"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow"
                :class="form.suiviPsychologique.enCours ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
            <span class="text-sm text-prado-text">
              {{ form.suiviPsychologique.enCours ? 'Suivi en cours' : 'Pas de suivi' }}
            </span>
          </label>

          <!-- Details (only if toggle on) -->
          <template v-if="form.suiviPsychologique.enCours">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                :value="form.suiviPsychologique.type"
                :class="inputClass"
                @change="updateSuiviPsy('type', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="t in TYPES_SUIVI_PSY" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
              <select
                :value="form.suiviPsychologique.frequence"
                :class="inputClass"
                @change="updateSuiviPsy('frequence', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="f in FREQUENCES_SUIVI" :key="f.value" :value="f.value">{{ f.label }}</option>
              </select>
            </div>
            <textarea
              :value="form.suiviPsychologique.notes"
              :class="inputClass"
              rows="2"
              placeholder="Notes sur le suivi..."
              @input="updateSuiviPsy('notes', ($event.target as HTMLTextAreaElement).value)"
            />
          </template>
        </div>
      </div>

      <!-- Traitements en cours (TagInput) -->
      <div class="md:col-span-2">
        <label :class="labelClass">Traitements en cours</label>
        <UiTagInput
          v-model="form.traitementsEnCours"
          :suggestions="[...MEDICAMENTS_COURANTS]"
          placeholder="Tapez pour rechercher ou ajouter un traitement..."
        />
      </div>

      <!-- Contacts d'urgence -->
      <div class="md:col-span-2">
        <label :class="labelClass">Contacts d'urgence</label>
        <JeuneContactsUrgence v-model="form.contactsUrgence" />
      </div>
    </div>

    <!-- Save -->
    <div class="flex justify-end pt-2">
      <button
        :disabled="saving"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#004657] text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        @click="emit('save')"
      >
        <Loader2 v-if="saving" :size="14" class="animate-spin" />
        Enregistrer la fiche sante
      </button>
    </div>
  </div>
</template>
