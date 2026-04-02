<script setup lang="ts">
import { BookOpen, FileText, UserPlus, ArrowRight, PartyPopper } from 'lucide-vue-next'

const { user } = useAuth()

const firstName = computed(() => user.value?.name?.split(' ')[0] ?? '')

const cards = [
  {
    icon: UserPlus,
    title: 'Ajouter votre premier jeune',
    desc: 'Créez une fiche pour inscrire un jeune à une action.',
    to: '/espace/jeunes',
    color: '#93C1AF',
  },
  {
    icon: BookOpen,
    title: 'Parcourir les 89 actions',
    desc: 'Ateliers, formations, stages — découvrez l\'offre complète.',
    to: '/espace',
    color: '#93C1AF',
  },
  {
    icon: FileText,
    title: 'Consulter les 183 ressources',
    desc: 'Guides pratiques, fiches dispositifs, outils pédagogiques.',
    to: '/espace',
    color: '#93C1AF',
  },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <div class="inline-flex items-center gap-2 text-prado-sage mb-4">
        <PartyPopper :size="20" />
        <span class="text-sm font-medium">Compte créé avec succès</span>
      </div>
      <h1 class="text-2xl md:text-3xl text-prado-text mb-3">
        Bienvenue{{ firstName ? ` ${firstName}` : '' }} !
      </h1>
      <p class="text-prado-text-secondary">
        Votre compte est actif. Voici ce que vous pouvez faire dès maintenant.
      </p>
    </div>

    <!-- Progress -->
    <OnboardingProgress :current="2" :total="3" />

    <!-- 3 action cards -->
    <div class="space-y-3">
      <NuxtLink
        v-for="card in cards"
        :key="card.title"
        :to="card.to"
        class="group flex items-center gap-4 p-4 rounded-xl bg-prado-surface border border-prado-border hover:border-prado-border-light transition-all"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          :style="{ backgroundColor: card.color + '15' }"
        >
          <component :is="card.icon" :size="22" :style="{ color: card.color }" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-prado-text font-medium">{{ card.title }}</div>
          <div class="text-sm text-prado-text-muted">{{ card.desc }}</div>
        </div>
        <ArrowRight
          :size="16"
          class="text-prado-text-muted group-hover:text-prado-text group-hover:translate-x-1 transition-all shrink-0"
        />
      </NuxtLink>
    </div>

    <!-- Info banner -->
    <div class="bg-prado-sage/10 rounded-xl p-4 text-sm">
      <p class="text-prado-sage font-medium mb-1">En attente de validation</p>
      <p class="text-prado-text-secondary">
        Votre compte sera validé par notre équipe sous 24h. En attendant, vous pouvez naviguer librement et préparer vos inscriptions.
      </p>
    </div>

    <!-- Go to dashboard -->
    <NuxtLink
      to="/espace"
      class="block w-full py-3 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] hover:bg-[var(--prado-signature)]/80 transition-colors text-center font-medium"
    >
      Accéder à mon espace
    </NuxtLink>
  </div>
</template>
