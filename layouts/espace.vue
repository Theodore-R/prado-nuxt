<script setup lang="ts">
import {
  LayoutDashboard, Users, ClipboardList, Settings, BookOpen, FileText, LogOut, Menu, X, Sun, Moon,
} from 'lucide-vue-next'
import { Toaster } from 'vue-sonner'

const { user, logout, jeunes, inscriptions } = useAuth()
const { theme, toggleTheme } = useTheme()
const { loadFromStorage, syncWithData } = useOnboarding()
const route = useRoute()

// Load and sync onboarding on every espace page
onMounted(() => {
  loadFromStorage()
  syncWithData({
    hasUser: !!user.value,
    hasProfile: !!(user.value?.name),
    jeunesCount: jeunes.value.length,
    inscriptionsCount: inscriptions.value.length,
  })
})

watch([user, jeunes, inscriptions], () => {
  syncWithData({
    hasUser: !!user.value,
    hasProfile: !!(user.value?.name),
    jeunesCount: jeunes.value.length,
    inscriptionsCount: inscriptions.value.length,
  })
})

const sidebarOpen = ref(false)

const navItems = [
  { to: '/espace', label: 'Tableau de bord', icon: LayoutDashboard, exact: true, badge: null as (() => number) | null },
  { to: '/espace/jeunes', label: 'Mes jeunes', icon: Users, exact: false, badge: () => jeunes.value.length },
  { to: '/espace/inscriptions', label: 'Inscriptions', icon: ClipboardList, exact: false, badge: () => inscriptions.value.length },
  { to: '/espace/actions', label: 'Actions', icon: BookOpen, exact: false, badge: null },
  { to: '/espace/ressources', label: 'Ressources', icon: FileText, exact: false, badge: null },
]

function isNavActive(to: string, exact: boolean) {
  if (exact) return route.path === to
  return route.path.startsWith(to)
}

async function handleLogout() {
  await logout()
  navigateTo('/connexion')
}
</script>

<template>
  <div class="min-h-screen flex bg-prado-bg">
    <Toaster position="top-right" rich-colors />

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:sticky inset-y-0 left-0 z-40 w-64 lg:top-0 lg:h-screen bg-prado-surface',
        'border-r border-prado-border flex flex-col shrink-0',
        'transform transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="h-16 flex items-center px-6 border-b border-prado-border">
        <span class="text-prado-text font-semibold tracking-wide text-sm">
          Mon espace
        </span>
      </div>

      <nav class="flex-1 py-4 px-3 space-y-1">
        <!-- Main nav -->
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
            isNavActive(item.to, item.exact)
              ? 'bg-prado-signature-muted text-prado-text font-medium'
              : 'text-prado-text-secondary hover:text-prado-text hover:bg-prado-surface-hover',
          ]"
          @click="sidebarOpen = false"
        >
          <span
            v-if="isNavActive(item.to, item.exact)"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-prado-signature"
          />
          <component :is="item.icon" :size="18" :class="isNavActive(item.to, item.exact) ? 'text-prado-signature' : ''" />
          <span class="flex-1">{{ item.label }}</span>
          <span
            v-if="item.badge && item.badge() > 0"
            class="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-prado-signature-text px-1.5 bg-prado-signature"
          >
            {{ item.badge() }}
          </span>
        </NuxtLink>

      </nav>

      <!-- Footer sidebar -->
      <div class="p-3 border-t border-prado-border space-y-1">
        <!-- Theme toggle -->
        <button
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover transition-colors"
          @click="toggleTheme"
        >
          <Sun v-if="theme === 'dark'" :size="18" />
          <Moon v-else :size="18" />
          <span>{{ theme === 'dark' ? 'Mode clair' : 'Mode sombre' }}</span>
        </button>

        <!-- Parametres -->
        <NuxtLink
          to="/espace/parametres"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
            isNavActive('/espace/parametres', false)
              ? 'bg-prado-teal text-white'
              : 'text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover',
          ]"
          @click="sidebarOpen = false"
        >
          <Settings :size="18" />
          <span>Parametres</span>
        </NuxtLink>

        <!-- Deconnexion -->
        <button
          class="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-prado-text-muted hover:text-red-400 hover:bg-prado-surface-hover transition-colors"
          @click="handleLogout"
        >
          <LogOut :size="18" />
          <span>Deconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top bar -->
      <header class="h-16 flex items-center justify-between px-6 border-b border-prado-border bg-prado-surface">
        <button
          class="lg:hidden p-2 rounded-lg text-prado-text hover:bg-prado-surface-hover"
          @click="sidebarOpen = !sidebarOpen"
        >
          <X v-if="sidebarOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>

        <div class="hidden lg:block text-sm text-prado-text-secondary">
          {{ user?.name }}
        </div>

        <div class="flex items-center gap-4" />
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>

      <AdminConfirmDialog />

      <!-- Onboarding widget + panel -->
      <OnboardingWidget />
      <OnboardingPanel />
    </div>
  </div>
</template>
