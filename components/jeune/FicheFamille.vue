<script setup lang="ts">
import { Loader2, Users, Plus, Trash2 } from 'lucide-vue-next'
import {
  MESURES_PROTECTION, LIEUX_HEBERGEMENT, DROITS_PARENTAUX_OPTIONS,
  FONCTIONS_REFERENT, LIENS_FAMILIAUX,
  emptyMembreFamille,
} from '~/lib/types/sante'
import type { JeuneSanteInput, ReferentAse, MembreFamille } from '~/lib/types/sante'

const props = defineProps<{
  saving: boolean
}>()

const emit = defineEmits<{
  save: []
}>()

const form = defineModel<JeuneSanteInput>({ required: true })

// Droits parentaux: "exercice-commun|Details..." → select + textarea
const droitsType = ref('')
const droitsDetails = ref('')

function parseDroits(val: string) {
  if (!val) {
    droitsType.value = ''
    droitsDetails.value = ''
    return
  }
  const sep = val.indexOf('|')
  if (sep !== -1) {
    droitsType.value = val.slice(0, sep)
    droitsDetails.value = val.slice(sep + 1)
  } else {
    const isKnown = DROITS_PARENTAUX_OPTIONS.some(o => o.value === val)
    if (isKnown) {
      droitsType.value = val
      droitsDetails.value = ''
    } else {
      droitsType.value = 'autre'
      droitsDetails.value = val
    }
  }
}

parseDroits(form.value.droitsParentaux)
watch(() => form.value.droitsParentaux, (val) => parseDroits(val))

function updateDroits() {
  if (!droitsType.value) {
    form.value = { ...form.value, droitsParentaux: '' }
  } else if (droitsDetails.value.trim()) {
    form.value = { ...form.value, droitsParentaux: `${droitsType.value}|${droitsDetails.value}` }
  } else {
    form.value = { ...form.value, droitsParentaux: droitsType.value }
  }
}

watch([droitsType, droitsDetails], () => updateDroits())

// Referent ASE helpers
function updateReferent(field: keyof ReferentAse, value: string) {
  form.value = {
    ...form.value,
    referentAse: { ...form.value.referentAse, [field]: value },
  }
}

// Composition familiale helpers
function addMembre() {
  form.value = {
    ...form.value,
    compositionFamiliale: [...form.value.compositionFamiliale, emptyMembreFamille()],
  }
}

function removeMembre(index: number) {
  form.value = {
    ...form.value,
    compositionFamiliale: form.value.compositionFamiliale.filter((_, i) => i !== index),
  }
}

function updateMembre(index: number, field: keyof MembreFamille, value: string | boolean) {
  form.value = {
    ...form.value,
    compositionFamiliale: form.value.compositionFamiliale.map((m, i) =>
      i === index ? { ...m, [field]: value } : m,
    ),
  }
}

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
const labelClass = 'text-sm text-prado-text-muted mb-1 block'
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 mb-2">
      <Users :size="16" class="text-[#FB6223]" />
      <h3 class="text-sm font-semibold text-prado-text">Situation familiale</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Mesure de protection (multi-select) -->
      <div class="md:col-span-2">
        <label :class="labelClass">Mesure(s) de protection</label>
        <UiMultiCheckbox v-model="form.mesureProtection" :options="MESURES_PROTECTION" />
      </div>

      <!-- Lieu d'hebergement -->
      <div>
        <label :class="labelClass">Lieu d'hebergement</label>
        <select v-model="form.lieuHebergement" :class="inputClass">
          <option v-for="l in LIEUX_HEBERGEMENT" :key="l.value" :value="l.value">{{ l.label }}</option>
        </select>
      </div>

      <!-- Referent ASE / PJJ (structured) -->
      <div class="md:col-span-2">
        <label :class="labelClass">Referent ASE / PJJ</label>
        <div class="bg-prado-bg rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            :value="form.referentAse.nom"
            :class="inputClass"
            placeholder="Nom du referent"
            @input="updateReferent('nom', ($event.target as HTMLInputElement).value)"
          />
          <select
            :value="form.referentAse.fonction"
            :class="inputClass"
            @change="updateReferent('fonction', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="f in FONCTIONS_REFERENT" :key="f.value" :value="f.value">{{ f.label }}</option>
          </select>
          <UiPhoneInput
            :model-value="form.referentAse.telephone"
            placeholder="Telephone"
            @update:model-value="updateReferent('telephone', $event)"
          />
          <input
            :value="form.referentAse.email"
            type="email"
            :class="inputClass"
            placeholder="Email"
            @input="updateReferent('email', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- Composition familiale (dynamic list) -->
      <div class="md:col-span-2">
        <label :class="labelClass">Composition familiale</label>
        <div class="space-y-2">
          <div
            v-for="(membre, index) in form.compositionFamiliale"
            :key="index"
            class="bg-prado-bg rounded-xl p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-prado-text-muted">Membre {{ index + 1 }}</span>
              <button
                class="p-1 rounded-lg hover:bg-red-500/10 text-prado-text-faint hover:text-red-400 transition-colors"
                @click="removeMembre(index)"
              >
                <Trash2 :size="13" />
              </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select
                :value="membre.lien"
                :class="inputClass"
                @change="updateMembre(index, 'lien', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="l in LIENS_FAMILIAUX" :key="l.value" :value="l.value">{{ l.label }}</option>
              </select>
              <input
                :value="membre.prenom"
                :class="inputClass"
                placeholder="Prenom"
                @input="updateMembre(index, 'prenom', ($event.target as HTMLInputElement).value)"
              />
              <input
                :value="membre.age"
                :class="inputClass"
                placeholder="Age"
                type="number"
                min="0"
                max="120"
                @input="updateMembre(index, 'age', ($event.target as HTMLInputElement).value)"
              />
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="membre.vitAvec"
                  class="rounded border-prado-border text-[#004657] focus:ring-[#004657]"
                  @change="updateMembre(index, 'vitAvec', ($event.target as HTMLInputElement).checked)"
                />
                <span class="text-xs text-prado-text-muted">Vit avec</span>
              </label>
            </div>
          </div>

          <button
            class="inline-flex items-center gap-1.5 text-xs text-[#004657] hover:underline"
            @click="addMembre"
          >
            <Plus :size="12" /> Ajouter un membre
          </button>
        </div>
      </div>

      <!-- Droits parentaux (select + textarea détails) -->
      <div class="md:col-span-2 space-y-2">
        <label :class="labelClass">Droits parentaux</label>
        <select v-model="droitsType" :class="inputClass">
          <option v-for="d in DROITS_PARENTAUX_OPTIONS" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
        <textarea
          v-if="droitsType"
          v-model="droitsDetails"
          :class="inputClass"
          rows="2"
          placeholder="Précisions : droits de visite, jugements en cours, détails..."
        />
      </div>

      <!-- Notes confidentielles -->
      <div class="md:col-span-2">
        <label :class="labelClass">Notes confidentielles</label>
        <textarea
          v-model="form.notesConfidentielles"
          :class="inputClass"
          rows="3"
          placeholder="Informations supplementaires strictement confidentielles..."
        />
        <p class="text-[10px] text-prado-text-faint mt-1">
          Ces notes sont chiffrees et accessibles uniquement aux prescripteurs autorises.
        </p>
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
        Enregistrer la situation familiale
      </button>
    </div>
  </div>
</template>
