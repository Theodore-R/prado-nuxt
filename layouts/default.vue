<script setup lang="ts">
import {
  Menu, X, User, LogOut, Heart, Facebook, Instagram, Linkedin, Youtube, Sun, Moon,
  ChevronDown, Truck, BookOpen, ArrowRight,
} from 'lucide-vue-next'
import { Toaster } from 'vue-sonner'

const { user, isAdmin, logout } = useAuth()
const { theme, toggleTheme } = useTheme()
const route = useRoute()

const menuOpen = ref(false)
const programmesOpen = ref(false)

const mainLinks = [
  { to: '/actions', label: 'Actions' },
  { to: '/ressources', label: 'Ressources' },
]

const programmeItems = [
  { to: '/foodtruck', label: 'Foodtruck « Les Saveurs d\'Élise »', desc: 'Insertion par la restauration mobile', icon: Truck, color: '#FB6223' },
  { to: '/fresque', label: 'Fresque de la Protection de l\'Enfance', desc: 'Atelier collaboratif de sensibilisation', icon: BookOpen, color: '#93C1AF' },
  { to: '/educolab', label: 'Compétences parentales', desc: 'Programmes Ces Années Incroyables & Parent d\'Ado', icon: Heart, color: '#C18ED8' },
]

const navLinks = [
  ...mainLinks,
  ...programmeItems.map(p => ({ to: p.to, label: p.label })),
]

const socialIcons = [Facebook, Instagram, Linkedin, Youtube]

function isActive(to: string) {
  return route.path.startsWith(to)
}

const isProgrammeActive = computed(() =>
  programmeItems.some(p => route.path.startsWith(p.to)),
)

function closeMenu() {
  menuOpen.value = false
  programmesOpen.value = false
}

function closeProgrammes() {
  programmesOpen.value = false
}

async function handleLogout() {
  await logout()
  closeMenu()
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-prado-bg">
    <Toaster position="top-right" rich-colors />

    <!-- Header -->
    <header class="sticky top-0 z-50 bg-prado-header-bg backdrop-blur-md border-b border-prado-border">
      <div class="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 relative">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0">
          <img src="/images/logo.png" alt="Prado Itinéraires" class="w-9 h-9 object-contain" />
          <span class="text-prado-text hidden sm:block text-sm tracking-wide">Prado Itinéraires</span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <!-- Actions -->
          <NuxtLink
            to="/actions"
            :class="[
              'nav-link relative px-3 py-1.5 text-sm transition-colors',
              isActive('/actions')
                ? 'text-prado-text is-active'
                : 'text-prado-text-secondary hover:text-prado-text',
            ]"
          >
            Actions
          </NuxtLink>

          <!-- Ressources -->
          <NuxtLink
            to="/ressources"
            :class="[
              'nav-link relative px-3 py-1.5 text-sm transition-colors',
              isActive('/ressources')
                ? 'text-prado-text is-active'
                : 'text-prado-text-secondary hover:text-prado-text',
            ]"
          >
            Ressources
          </NuxtLink>

          <!-- Programmes dropdown -->
          <div
            class="relative"
            @mouseenter="programmesOpen = true"
            @mouseleave="programmesOpen = false"
          >
            <button
              :class="[
                'nav-link relative flex items-center gap-1 px-3 py-1.5 text-sm transition-colors',
                isProgrammeActive
                  ? 'text-prado-text is-active'
                  : programmesOpen
                    ? 'text-prado-text'
                    : 'text-prado-text-secondary hover:text-prado-text',
              ]"
            >
              Nos programmes
              <ChevronDown
                :size="14"
                class="transition-transform duration-200"
                :class="programmesOpen ? 'rotate-180' : ''"
              />
            </button>

            <!-- Mega dropdown -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div
                v-if="programmesOpen"
                class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] p-2 rounded-xl border border-prado-border shadow-2xl"
                style="background-color: var(--prado-surface);"
              >
                <NuxtLink
                  v-for="item in programmeItems"
                  :key="item.to"
                  :to="item.to"
                  class="flex items-start gap-3 p-3 rounded-lg hover:bg-prado-surface-hover active:scale-[0.98] transition-all group"
                  @click="closeProgrammes"
                >
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    :style="{ backgroundColor: item.color + '15' }"
                  >
                    <component :is="item.icon" :size="18" :style="{ color: item.color }" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm text-prado-text font-medium flex items-center gap-1">
                      {{ item.label }}
                      <ArrowRight :size="12" class="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div class="text-xs text-prado-text-muted mt-0.5">{{ item.desc }}</div>
                  </div>
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </nav>

        <!-- Desktop right -->
        <!-- Desktop right -->
        <div class="hidden lg:flex items-center gap-1.5 shrink-0">
          <template v-if="user">
            <NuxtLink
              v-if="isAdmin"
              to="/admin"
              class="px-3 py-1.5 rounded-full bg-[#004657] text-white text-xs hover:bg-[#003545] active:scale-95 transition-all"
            >
              Admin
            </NuxtLink>
            <NuxtLink
              to="/mon-compte"
              class="flex items-center gap-2 px-4 py-1.5 rounded-full border border-prado-border-medium text-prado-text text-sm hover:bg-prado-surface-hover active:scale-95 transition-all"
            >
              <User :size="14" />
              <span>{{ user.name?.split(' ')[0] }}</span>
            </NuxtLink>
            <button
              class="p-2 rounded-full hover:bg-prado-surface-hover text-prado-text-muted hover:text-prado-text active:scale-90 transition-all"
              title="Déconnexion"
              @click="logout()"
            >
              <LogOut :size="15" />
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/connexion"
              class="px-3 py-1.5 text-sm text-prado-text-secondary hover:text-prado-text transition-colors"
            >
              Se connecter
            </NuxtLink>
            <NuxtLink
              to="/connexion?mode=register"
              class="px-4 py-1.5 rounded-full bg-[#CF006C] text-white text-sm hover:bg-[#a80057] active:scale-95 transition-all font-medium"
            >
              Créer un compte
            </NuxtLink>
          </template>

          <!-- Separator -->
          <div class="w-px h-5 bg-prado-border mx-1" />

          <!-- Icon buttons -->
          <a
            href="https://www.le-prado.fr/don/"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 rounded-full text-[#FB6223] hover:bg-[#FB6223]/10 active:scale-90 transition-all"
            title="Faire un don"
          >
            <Heart :size="16" />
          </a>
          <button
            class="p-2 rounded-full text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover active:scale-90 transition-all"
            aria-label="Changer de thème"
            @click="toggleTheme"
          >
            <Sun v-if="theme === 'dark'" :size="16" />
            <Moon v-else :size="16" />
          </button>
        </div>

        <!-- Mobile right -->
        <div class="lg:hidden flex items-center gap-1">
          <button
            class="p-2 text-prado-text-secondary"
            aria-label="Changer de thème"
            @click="toggleTheme"
          >
            <Sun v-if="theme === 'dark'" :size="20" />
            <Moon v-else :size="20" />
          </button>
          <button class="p-2 text-prado-text" @click="menuOpen = !menuOpen">
            <X v-if="menuOpen" :size="22" />
            <Menu v-else :size="22" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="menuOpen" class="lg:hidden border-t border-prado-border bg-prado-bg px-6 pb-6 pt-3">
          <!-- Main links -->
          <NuxtLink
            to="/actions"
            :class="[
              'block px-3 py-2.5 rounded-lg text-sm',
              isActive('/actions') ? 'text-prado-text bg-prado-surface-hover' : 'text-prado-text-secondary',
            ]"
            @click="closeMenu"
          >
            Actions
          </NuxtLink>
          <NuxtLink
            to="/ressources"
            :class="[
              'block px-3 py-2.5 rounded-lg text-sm',
              isActive('/ressources') ? 'text-prado-text bg-prado-surface-hover' : 'text-prado-text-secondary',
            ]"
            @click="closeMenu"
          >
            Ressources
          </NuxtLink>

          <!-- Programmes section -->
          <div class="mt-2 mb-1 px-3 text-xs text-prado-text-faint uppercase tracking-wider">Nos programmes</div>
          <NuxtLink
            v-for="item in programmeItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm',
              isActive(item.to) ? 'text-prado-text bg-prado-surface-hover' : 'text-prado-text-secondary',
            ]"
            @click="closeMenu"
          >
            <component :is="item.icon" :size="16" :style="{ color: item.color }" />
            {{ item.label.split('«')[0].split('de la')[0].trim() }}
          </NuxtLink>

          <!-- Auth section -->
          <div class="border-t border-prado-border mt-3 pt-3">
            <template v-if="user">
              <NuxtLink
                to="/mon-compte"
                class="flex items-center gap-2 px-3 py-2.5 text-prado-text text-sm"
                @click="closeMenu"
              >
                <User :size="16" /> Mon espace
              </NuxtLink>
              <button
                class="flex items-center gap-2 px-3 py-2.5 text-red-400 text-sm w-full text-left"
                @click="handleLogout"
              >
                <LogOut :size="16" /> Déconnexion
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/connexion"
                class="block px-3 py-2.5 text-prado-text-secondary text-sm"
                @click="closeMenu"
              >
                Se connecter
              </NuxtLink>
              <NuxtLink
                to="/connexion?mode=register"
                class="block mt-2 py-2.5 rounded-full bg-[#CF006C] text-white text-sm text-center font-medium"
                @click="closeMenu"
              >
                Créer un compte
              </NuxtLink>
            </template>
            <a
              href="https://www.le-prado.fr/don/"
              target="_blank"
              rel="noopener noreferrer"
              class="block mt-2 py-2.5 rounded-full border border-[#FB6223]/30 text-[#FB6223] text-sm text-center"
              @click="closeMenu"
            >
              Faire un don
            </a>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Main -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-prado-bg-deep border-t border-prado-border">
      <div class="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div class="flex items-center gap-2.5 mb-4">
            <img src="/images/logo.png" alt="Prado Itinéraires" class="w-8 h-8 object-contain" />
            <span class="text-prado-text text-sm">Prado Itinéraires</span>
          </div>
          <p class="text-sm text-prado-text-muted leading-relaxed">
            Innovation sociale au service des jeunes et des familles. Lyon, France.
          </p>
        </div>
        <div>
          <h4 class="text-prado-text-secondary text-xs uppercase tracking-wider mb-4">Navigation</h4>
          <div class="flex flex-col gap-2">
            <NuxtLink
              v-for="l in navLinks"
              :key="l.to"
              :to="l.to"
              class="text-sm text-prado-text-muted hover:text-[#FB6223] transition-colors"
            >
              {{ l.label }}
            </NuxtLink>
          </div>
        </div>
        <div>
          <h4 class="text-prado-text-secondary text-xs uppercase tracking-wider mb-4">Contact</h4>
          <div class="space-y-2 text-sm text-prado-text-muted">
            <p>itineraires@le-prado.fr</p>
            <p>04 72 XX XX XX</p>
            <p>Lyon 7e, France</p>
          </div>
          <a
            href="https://www.le-prado.fr/don/"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block mt-4 px-4 py-2 rounded-full border border-[#FB6223]/30 text-[#FB6223] text-sm hover:bg-[#FB6223]/10 transition-colors"
          >
            Faire un don
          </a>
        </div>
        <div>
          <h4 class="text-prado-text-secondary text-xs uppercase tracking-wider mb-4">Newsletter</h4>
          <p class="text-sm text-prado-text-muted mb-3">Recevez nos actualités</p>
          <UiNewsletterForm source="footer" />
          <div class="flex gap-2 mt-5">
            <a
              v-for="(Icon, i) in socialIcons"
              :key="i"
              href="#"
              class="w-9 h-9 rounded-full bg-prado-tag-bg flex items-center justify-center text-prado-text-muted hover:bg-[#CF006C] hover:text-white transition-colors"
            >
              <component :is="Icon" :size="15" />
            </a>
          </div>
        </div>
      </div>
      <div class="border-t border-prado-border py-5 text-center text-xs text-prado-text-faint">
        &copy; 2026 Prado Itinéraires — Fondation du Prado. Tous droits réservés.
      </div>
    </footer>

    <!-- Chat widget (flottant, toutes les pages) -->
    <ClientOnly>
      <UiChatWidget />
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Animated underline on nav links */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  border-radius: 1px;
  background: #CF006C;
  transform: scaleX(0);
  transition: transform 0.25s ease-out;
}

.nav-link:hover::after {
  transform: scaleX(1);
}

.nav-link.is-active::after {
  transform: scaleX(1);
}
</style>
