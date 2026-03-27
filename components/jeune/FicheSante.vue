<script setup lang="ts">
import { Loader2, Heart, Plus, Trash2 } from 'lucide-vue-next'
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

// Suivi médical helpers
function addSuivi() {
  form.value = {
    ...form.value,
    suiviMedical: [...form.value.suiviMedical, emptySuiviMedicalEntry()],
  }
}

function removeSuivi(index: number) {
  form.value = {
    ...form.value,
    suiviMedical: form.value.suiviMedical.filter((_, i) => i !== index),
  }
}

function updateSuivi(index: number, field: keyof SuiviMedicalEntry, value: string) {
  form.value = {
    ...form.value,
    suiviMedical: form.value.suiviMedical.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    ),
  }
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

      <!-- Suivi medical (dynamic list) -->
      <div class="md:col-span-2">
        <label :class="labelClass">Suivi medical</label>
        <div class="space-y-2">
          <div
            v-for="(suivi, index) in form.suiviMedical"
            :key="index"
            class="bg-prado-bg rounded-xl p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-prado-text-muted">Suivi {{ index + 1 }}</span>
              <button
                class="p-1 rounded-lg hover:bg-red-500/10 text-prado-text-faint hover:text-red-400 transition-colors"
                @click="removeSuivi(index)"
              >
                <Trash2 :size="13" />
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                :value="suivi.specialite"
                :class="inputClass"
                @change="updateSuivi(index, 'specialite', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="s in SPECIALITES_MEDICALES" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
              <select
                :value="suivi.frequence"
                :class="inputClass"
                @change="updateSuivi(index, 'frequence', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="f in FREQUENCES_SUIVI" :key="f.value" :value="f.value">{{ f.label }}</option>
              </select>
              <input
                :value="suivi.details"
                :class="inputClass"
                placeholder="Details (nom, lieu...)"
                @input="updateSuivi(index, 'details', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>

          <button
            class="inline-flex items-center gap-1.5 text-xs text-[#004657] hover:underline"
            @click="addSuivi"
          >
            <Plus :size="12" /> Ajouter un suivi
          </button>
        </div>
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
