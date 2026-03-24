<script setup lang="ts">
interface Props {
  mediaType?: 'video' | 'image'
  mediaSrc: string
  posterSrc?: string
  bgImageSrc?: string
  bgColor?: string
  title?: string
  subtitle?: string
  scrollHint?: string
  textBlend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mediaType: 'image',
  textBlend: false,
})

const isYoutube = computed(() => {
  return props.mediaSrc.includes('youtube.com') || props.mediaSrc.includes('youtu.be')
})

const youtubeEmbedUrl = computed(() => {
  if (!isYoutube.value) return ''
  let videoId = ''
  if (props.mediaSrc.includes('youtu.be/')) {
    videoId = props.mediaSrc.split('youtu.be/')[1]?.split(/[?&#]/)[0] ?? ''
  } else if (props.mediaSrc.includes('v=')) {
    videoId = props.mediaSrc.split('v=')[1]?.split(/[?&#]/)[0] ?? ''
  } else if (props.mediaSrc.includes('embed/')) {
    videoId = props.mediaSrc.split('embed/')[1]?.split(/[?&#]/)[0] ?? ''
  }
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=${videoId}`
})

const scrollProgress = ref(0)
const showContent = ref(false)
const mediaFullyExpanded = ref(false)
const touchStartY = ref(0)
const isMobile = ref(false)
const sectionRef = ref<HTMLDivElement | null>(null)

watch(() => props.mediaType, () => {
  scrollProgress.value = 0
  showContent.value = false
  mediaFullyExpanded.value = false
})

const mediaWidth = computed(() => 300 + scrollProgress.value * (isMobile.value ? 650 : 1250))
const mediaHeight = computed(() => 400 + scrollProgress.value * (isMobile.value ? 200 : 400))
const textTranslateX = computed(() => scrollProgress.value * (isMobile.value ? 180 : 150))
const bgOpacity = computed(() => 1 - scrollProgress.value)
const overlayOpacity = computed(() => 0.5 - scrollProgress.value * 0.3)
const contentOpacity = computed(() => showContent.value ? 1 : 0)

const firstWord = computed(() => props.title?.split(' ')[0] ?? '')
const restOfTitle = computed(() => props.title?.split(' ').slice(1).join(' ') ?? '')

function handleWheel(e: WheelEvent) {
  if (mediaFullyExpanded.value && e.deltaY < 0 && window.scrollY <= 5) {
    mediaFullyExpanded.value = false
    e.preventDefault()
  } else if (!mediaFullyExpanded.value) {
    e.preventDefault()
    const scrollDelta = e.deltaY * 0.0009
    const newProgress = Math.min(Math.max(scrollProgress.value + scrollDelta, 0), 1)
    scrollProgress.value = newProgress

    if (newProgress >= 1) {
      mediaFullyExpanded.value = true
      showContent.value = true
    } else if (newProgress < 0.75) {
      showContent.value = false
    }
  }
}

function handleTouchStart(e: TouchEvent) {
  touchStartY.value = e.touches[0].clientY
}

function handleTouchMove(e: TouchEvent) {
  if (!touchStartY.value) return

  const touchY = e.touches[0].clientY
  const deltaY = touchStartY.value - touchY

  if (mediaFullyExpanded.value && deltaY < -20 && window.scrollY <= 5) {
    mediaFullyExpanded.value = false
    e.preventDefault()
  } else if (!mediaFullyExpanded.value) {
    e.preventDefault()
    const scrollFactor = deltaY < 0 ? 0.008 : 0.005
    const scrollDelta = deltaY * scrollFactor
    const newProgress = Math.min(Math.max(scrollProgress.value + scrollDelta, 0), 1)
    scrollProgress.value = newProgress

    if (newProgress >= 1) {
      mediaFullyExpanded.value = true
      showContent.value = true
    } else if (newProgress < 0.75) {
      showContent.value = false
    }

    touchStartY.value = touchY
  }
}

function handleTouchEnd() {
  touchStartY.value = 0
}

function handleScroll() {
  if (!mediaFullyExpanded.value) {
    window.scrollTo(0, 0)
  }
}

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('touchstart', handleTouchStart, { passive: false })
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('touchend', handleTouchEnd)
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('wheel', handleWheel)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('touchend', handleTouchEnd)
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div
    ref="sectionRef"
    class="transition-colors duration-700 ease-in-out overflow-x-hidden bg-prado-bg"
  >
    <section class="relative flex flex-col items-center justify-start min-h-[100dvh]">
      <div class="relative w-full flex flex-col items-center min-h-[100dvh]">
        <!-- Background -->
        <div
          class="absolute inset-0 z-0 h-full transition-opacity duration-100"
          :style="{ opacity: bgOpacity }"
        >
          <img
            v-if="bgImageSrc"
            :src="bgImageSrc"
            alt="Background"
            class="w-screen h-screen object-cover object-center"
          />
          <div v-else class="w-screen h-screen bg-prado-bg" />
          <div v-if="bgImageSrc" class="absolute inset-0 hero-overlay" />
        </div>

        <div class="container mx-auto flex flex-col items-center justify-start relative z-10">
          <div class="flex flex-col items-center justify-center w-full h-[100dvh] relative">

            <!-- Expanding media container -->
            <div
              class="absolute z-[2] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl hero-media-shadow"
              :style="{
                width: `${mediaWidth}px`,
                height: `${mediaHeight}px`,
                maxWidth: '95vw',
                maxHeight: '85vh',
              }"
            >
              <!-- YouTube Video -->
              <div
                v-if="mediaType === 'video' && isYoutube"
                class="relative w-full h-full pointer-events-none"
              >
                <iframe
                  :src="youtubeEmbedUrl"
                  class="w-full h-full rounded-xl"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                />
                <div class="absolute inset-0 z-10 pointer-events-none" />
                <div
                  class="absolute inset-0 bg-black/30 rounded-xl transition-opacity duration-200"
                  :style="{ opacity: overlayOpacity }"
                />
              </div>

              <!-- Direct Video -->
              <div
                v-else-if="mediaType === 'video'"
                class="relative w-full h-full pointer-events-none"
              >
                <video
                  :src="mediaSrc"
                  :poster="posterSrc"
                  autoplay
                  muted
                  loop
                  playsinline
                  preload="auto"
                  class="w-full h-full object-cover rounded-xl"
                />
                <div class="absolute inset-0 z-10 pointer-events-none" />
                <div
                  class="absolute inset-0 bg-black/30 rounded-xl transition-opacity duration-200"
                  :style="{ opacity: overlayOpacity }"
                />
              </div>

              <!-- Image -->
              <div v-else class="relative w-full h-full">
                <img
                  :src="mediaSrc"
                  :alt="title || 'Media content'"
                  class="w-full h-full object-cover rounded-xl"
                />
                <div
                  class="absolute inset-0 hero-image-overlay rounded-xl transition-opacity duration-200"
                  :style="{ opacity: 0.7 - scrollProgress * 0.3 }"
                />
              </div>

              <!-- Sub-text under media -->
              <div class="flex flex-col items-center text-center relative z-10 mt-4">
                <p
                  v-if="subtitle"
                  class="text-2xl text-prado-text-secondary"
                  :style="{ transform: `translateX(-${textTranslateX}vw)` }"
                >
                  {{ subtitle }}
                </p>
                <p
                  v-if="scrollHint"
                  class="text-prado-text-muted font-medium text-center"
                  :style="{ transform: `translateX(${textTranslateX}vw)` }"
                >
                  {{ scrollHint }}
                </p>
              </div>
            </div>

            <!-- Title overlay -->
            <div
              class="flex items-center justify-center text-center gap-4 w-full relative z-10 flex-col"
              :class="textBlend ? 'mix-blend-difference' : 'mix-blend-normal'"
            >
              <h1
                class="text-4xl md:text-5xl lg:text-6xl font-bold text-prado-text"
                :style="{
                  transform: `translateX(-${textTranslateX}vw)`,
                  fontFamily: 'Poppins',
                }"
              >
                {{ firstWord }}
              </h1>
              <h1
                class="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-prado-text"
                :style="{
                  transform: `translateX(${textTranslateX}vw)`,
                  fontFamily: 'Poppins',
                }"
              >
                {{ restOfTitle }}
              </h1>
            </div>
          </div>

          <!-- Content slot (visible after expansion) -->
          <section
            class="flex flex-col w-full px-8 py-10 md:px-16 lg:py-20 transition-opacity duration-700"
            :style="{ opacity: contentOpacity }"
          >
            <slot />
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Dark mode: dark overlay on bg image */
.hero-overlay {
  background: rgba(0, 0, 0, 0.6);
}

.hero-image-overlay {
  background: rgba(0, 0, 0, 0.5);
}

.hero-media-shadow {
  box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.3);
}

/* Light mode: light overlay */
[data-theme="light"] .hero-overlay {
  background: rgba(255, 255, 255, 0.5);
}

[data-theme="light"] .hero-image-overlay {
  background: rgba(255, 255, 255, 0.3);
}

[data-theme="light"] .hero-media-shadow {
  box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.1);
}
</style>
