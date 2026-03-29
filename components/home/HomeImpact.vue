<script setup lang="ts">
let gsap: typeof import('gsap')['gsap'] | null = null

interface Stat {
  value: number
  suffix: string
  label: string
  color: string
}

const props = defineProps<{ data?: any }>()

const defaultStats: Stat[] = [
  { value: 89, suffix: '', label: 'actions et ateliers programmés sur le territoire', color: '#CF006C' },
  { value: 183, suffix: '', label: 'ressources professionnelles en accès libre', color: '#FB6223' },
  { value: 500, suffix: '+', label: 'jeunes accompagnés chaque année', color: '#C18ED8' },
  { value: 50, suffix: '+', label: 'structures partenaires sur la Métropole de Lyon', color: '#93C1AF' },
]

const stats = computed<Stat[]>(() => {
  if (props.data?.items?.length) {
    return props.data.items.map((item: any) => ({
      value: item.value ?? 0,
      suffix: item.suffix ?? '',
      label: item.label ?? '',
      color: item.color ?? '#CF006C',
    }))
  }
  return defaultStats
})

const displayValues = ref(stats.value.map(() => 0))
const sectionRef = ref<HTMLElement | null>(null)
const hasAnimated = ref(false)

watch(stats, (newStats) => {
  if (!hasAnimated.value) {
    displayValues.value = newStats.map(() => 0)
  }
})

async function animateCounters() {
  if (hasAnimated.value) return
  hasAnimated.value = true

  if (!gsap) {
    const mod = await import('gsap')
    gsap = mod.gsap
  }

  stats.value.forEach((stat, idx) => {
    const obj = { val: 0 }
    gsap!.to(obj, {
      val: stat.value,
      duration: 2,
      ease: 'power2.out',
      delay: idx * 0.15,
      onUpdate() {
        const newArr = [...displayValues.value]
        newArr[idx] = Math.round(obj.val)
        displayValues.value = newArr
      },
    })
  })
}

onMounted(() => {
  if (!sectionRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animateCounters()
        observer.disconnect()
      }
    },
    { threshold: 0.3 },
  )
  observer.observe(sectionRef.value)
})
</script>

<template>
  <section
    ref="sectionRef"
    class="py-24 my-16 bg-[var(--prado-signature)]"
  >
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
        <div v-for="(stat, idx) in stats" :key="stat.label">
          <div class="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--prado-signature-text)] mb-2">
            {{ displayValues[idx] }}{{ stat.suffix }}
          </div>
          <div class="text-[var(--prado-signature-text)]/70 text-base leading-snug">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
