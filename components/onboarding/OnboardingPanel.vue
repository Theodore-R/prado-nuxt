<script setup lang="ts">
import { X, Check, ArrowRight, Clock, Sparkles } from 'lucide-vue-next'

const { steps, panelOpen, closePanel, completedCount, totalSteps, progress, dismiss, isComplete } = useOnboarding()

const expandedStep = ref<string | null>(null)

function toggleStep(key: string) {
  expandedStep.value = expandedStep.value === key ? null : key
}

// Auto-expand next incomplete step
watch(panelOpen, (open) => {
  if (open) {
    const next = steps.value.find(s => !s.done)
    expandedStep.value = next?.key ?? null
  }
})

// Confetti on 100%
watch(isComplete, async (complete) => {
  if (complete && import.meta.client) {
    const confetti = (await import('canvas-confetti')).default
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#CF006C', '#93C1AF', '#FB6223', '#004657'],
    })
  }
})

const radius = 40
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() =>
  circumference - (progress.value / 100) * circumference,
)
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="panelOpen"
        class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        @click="closePanel"
      />
    </Transition>

    <!-- Panel -->
    <Transition name="slide">
      <div
        v-if="panelOpen"
        class="fixed top-0 right-0 bottom-0 z-[61] w-full max-w-md border-l border-prado-border overflow-y-auto flex flex-col"
        style="background-color: var(--prado-surface);"
      >
        <!-- Header -->
        <div class="p-6 border-b border-prado-border">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-lg font-semibold text-prado-text">Démarrage rapide</h2>
              <p class="text-sm text-prado-text-muted mt-1">Complétez ces étapes pour être opérationnel·le</p>
            </div>
            <button
              class="p-1.5 rounded-lg hover:bg-prado-surface-hover text-prado-text-muted transition-colors"
              @click="closePanel"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Progress ring -->
          <div class="flex items-center gap-4">
            <div class="relative w-24 h-24 shrink-0">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" :r="radius"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="5"
                  class="text-prado-border"
                />
                <circle
                  cx="50" cy="50" :r="radius"
                  fill="none"
                  stroke="url(#progress-gradient)"
                  stroke-width="5"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="strokeDashoffset"
                  class="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#FFD228" />
                    <stop offset="100%" stop-color="#FB6223" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-prado-text">{{ progress }}%</span>
              </div>
            </div>
            <div>
              <p class="text-2xl font-bold text-prado-text">{{ completedCount }} <span class="text-sm font-normal text-prado-text-muted">/ {{ totalSteps }}</span></p>
              <p class="text-sm text-prado-text-muted">étapes complétées</p>
            </div>
          </div>
        </div>

        <!-- Steps -->
        <div class="flex-1 p-4 space-y-2">
          <div
            v-for="step in steps"
            :key="step.key"
            class="rounded-xl border transition-all"
            :class="[
              step.done
                ? 'border-[#93C1AF]/30 bg-[#93C1AF]/5'
                : expandedStep === step.key
                  ? 'border-prado-teal/40 bg-prado-teal/5'
                  : 'border-prado-border bg-prado-surface',
            ]"
          >
            <!-- Step header -->
            <button
              class="flex items-center gap-3 w-full px-4 py-3 text-left"
              @click="toggleStep(step.key)"
            >
              <!-- Checkmark -->
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                :class="step.done
                  ? 'bg-[#93C1AF] scale-100'
                  : 'border-2 border-prado-border-medium'"
              >
                <Check v-if="step.done" :size="14" class="text-white" />
              </div>

              <!-- Label -->
              <span
                class="flex-1 text-sm font-medium transition-colors"
                :class="step.done ? 'text-prado-text-muted line-through' : 'text-prado-text'"
              >
                {{ step.label }}
              </span>

              <!-- Duration badge -->
              <span
                v-if="step.duration && !step.done"
                class="text-xs text-prado-text-faint flex items-center gap-1"
              >
                <Clock :size="11" />
                {{ step.duration }}
              </span>
            </button>

            <!-- Expanded content -->
            <div
              v-if="expandedStep === step.key && !step.done"
              class="px-4 pb-4 pt-0"
            >
              <p class="text-sm text-prado-text-secondary mb-3 pl-9">
                {{ step.description }}
              </p>
              <NuxtLink
                v-if="step.link"
                :to="step.link"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-prado-teal text-white text-sm hover:opacity-90 transition-opacity ml-9"
                @click="closePanel"
              >
                Commencer <ArrowRight :size="14" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-prado-border">
          <div v-if="isComplete" class="text-center py-2">
            <div class="flex items-center justify-center gap-2 text-[#93C1AF] mb-1">
              <Sparkles :size="16" />
              <span class="text-sm font-medium">Félicitations, tout est prêt !</span>
            </div>
          </div>
          <button
            class="w-full text-center text-xs text-prado-text-faint hover:text-prado-text-muted transition-colors py-2"
            @click="dismiss(); closePanel()"
          >
            Masquer définitivement
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-leave-active { transition: transform 0.2s ease-in; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
