<script setup lang="ts">
interface Props {
  mediaType?: 'video' | 'image'
  mediaSrc: string
  posterSrc?: string
  bgImageSrc?: string
  bgColor?: string
  title?: string
  titleLine1?: string
  titleLine2?: string
  titleLine2Rotating?: string[]
  highlightLine?: 1 | 2
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

const targetProgress = ref(0)
const displayProgress = ref(0)
const showContent = ref(false)
const mediaFullyExpanded = ref(false)
const touchStartY = ref(0)
const isMobile = ref(false)
const sectionRef = ref<HTMLDivElement | null>(null)
let rafId: number | null = null

const LERP_FACTOR = 0.1

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor
}

function animate() {
  const diff = targetProgress.value - displayProgress.value
  if (Math.abs(diff) > 0.0005) {
    displayProgress.value = lerp(displayProgress.value, targetProgress.value, LERP_FACTOR)
    rafId = requestAnimationFrame(animate)
  } else {
    displayProgress.value = targetProgress.value
    rafId = null
  }
}

function startAnimation() {
  if (rafId === null) {
    rafId = requestAnimationFrame(animate)
  }
}

watch(() => props.mediaType, () => {
  targetProgress.value = 0
  displayProgress.value = 0
  showContent.value = false
  mediaFullyExpanded.value = false
})

const mediaWidth = computed(() => 300 + displayProgress.value * (isMobile.value ? 650 : 1250))
const mediaHeight = computed(() => 400 + displayProgress.value * (isMobile.value ? 200 : 400))
const textTranslateX = computed(() => displayProgress.value * (isMobile.value ? 180 : 150))
const bgOpacity = computed(() => 1 - displayProgress.value)
const overlayOpacity = computed(() => 0.5 - displayProgress.value * 0.3)
const contentOpacity = computed(() => showContent.value ? 1 : 0)

const line1 = computed(() => props.titleLine1 ?? props.title?.split(' ')[0] ?? '')
const line2Static = computed(() => props.titleLine2 ?? props.title?.split(' ').slice(1).join(' ') ?? '')

// Rotating words for line 2
const rotatingWords = computed(() => props.titleLine2Rotating ?? [])
const currentRotatingIndex = ref(0)
const rotatingVisible = ref(true)

let rotatingInterval: ReturnType<typeof setInterval> | null = null

function handleWheel(e: WheelEvent) {
  if (mediaFullyExpanded.value && e.deltaY < 0 && window.scrollY <= 5) {
    mediaFullyExpanded.value = false
    e.preventDefault()
  } else if (!mediaFullyExpanded.value) {
    e.preventDefault()
    const scrollDelta = e.deltaY * 0.0009
    const newProgress = Math.min(Math.max(targetProgress.value + scrollDelta, 0), 1)
    targetProgress.value = newProgress
    startAnimation()

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
    const newProgress = Math.min(Math.max(targetProgress.value + scrollDelta, 0), 1)
    targetProgress.value = newProgress
    startAnimation()

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

  // Rotating words
  if (rotatingWords.value.length > 0) {
    rotatingInterval = setInterval(() => {
      rotatingVisible.value = false
      setTimeout(() => {
        currentRotatingIndex.value = (currentRotatingIndex.value + 1) % rotatingWords.value.length
        rotatingVisible.value = true
      }, 400)
    }, 4500)
  }
})

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (rotatingInterval) clearInterval(rotatingInterval)
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
    class="transition-colors duration-700 ease-in-out overflow-x-hidden hero-gradient-bg"
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
          <div v-else class="w-screen h-screen hero-gradient-bg" />
          <div v-if="bgImageSrc" class="absolute inset-0 hero-overlay" />
        </div>

        <div class="container mx-auto flex flex-col items-center justify-start relative z-10">
          <div class="flex flex-col items-center justify-center w-full h-[100dvh] relative">

            <!-- Expanding media container -->
            <div
              class="absolute z-[2] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl hero-media-shadow will-change-[width,height]"
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
                  :style="{ opacity: 0.7 - displayProgress * 0.3 }"
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
              class="flex items-center justify-center text-center gap-2 md:gap-4 w-full relative z-10 flex-col"
              :class="textBlend ? 'mix-blend-difference' : 'mix-blend-normal'"
            >
              <h1
                class="text-3xl md:text-5xl lg:text-6xl font-bold text-prado-text"
                :style="{
                  transform: `translateX(-${textTranslateX}vw)`,
                  fontFamily: 'Poppins',
                }"
              >
                <span v-if="highlightLine === 1" class="hero-highlight">{{ line1 }}</span>
                <template v-else>{{ line1 }}</template>
              </h1>
              <h1
                class="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-prado-text"
                :style="{
                  transform: `translateX(${textTranslateX}vw)`,
                  fontFamily: 'Poppins',
                }"
              >
                <template v-if="rotatingWords.length > 0">
                  {{ line2Static }}&nbsp;<span
                    class="inline-block transition-all duration-400"
                    :class="rotatingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'"
                  >{{ rotatingWords[currentRotatingIndex] }}</span>
                </template>
                <template v-else>
                  <span v-if="highlightLine === 2" class="hero-highlight">{{ line2Static }}</span>
                  <template v-else>{{ line2Static }}</template>
                </template>
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

/* Hero gradient background */
.hero-gradient-bg {
  background: var(--prado-bg);
}

[data-theme="light"] .hero-gradient-bg {
  background:
    radial-gradient(ellipse 70% 70% at 0% 0%, rgba(255, 210, 40, 0.45) 0%, transparent 60%),
    var(--prado-bg);
}

/* Yellow diagonal highlight on title */
.hero-highlight {
  position: relative;
  display: inline;
  isolation: isolate;
}
.hero-highlight::before {
  content: '';
  position: absolute;
  left: -8px;
  right: -8px;
  bottom: 0%;
  height: 80%;
  background: var(--prado-signature);
  transform: rotate(-2deg);
  z-index: -1;
  border-radius: 4px;
  pointer-events: none;
  clip-path: inset(0 100% 0 0);
  animation: highlight-reveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards;
}

@keyframes highlight-reveal {
  to { clip-path: inset(0 0 0 0); }
}
</style>
