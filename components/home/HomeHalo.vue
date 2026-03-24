<script setup lang="ts">
interface Props {
  color: string
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-left' | 'bottom-right'
  size?: number
  opacity?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
  size: 600,
  opacity: 0.06,
})

const haloRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const positionClasses: Record<string, string> = {
  'top-right': '-top-1/3 -right-1/4',
  'top-left': '-top-1/3 -left-1/4',
  'top-center': '-top-1/3 left-1/2 -translate-x-1/2',
  'bottom-left': '-bottom-1/3 -left-1/4',
  'bottom-right': '-bottom-1/3 -right-1/4',
}

onMounted(() => {
  if (!haloRef.value) return
  const observer = new IntersectionObserver(
    (entries) => {
      isVisible.value = entries[0].isIntersecting
    },
    { threshold: 0, rootMargin: '100px' },
  )
  observer.observe(haloRef.value)

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div
    ref="haloRef"
    class="absolute rounded-full pointer-events-none transition-all duration-1000 ease-out"
    :class="[
      positionClasses[position],
      isVisible ? 'scale-100' : 'scale-50',
    ]"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity: isVisible ? opacity : 0,
      filter: 'blur(40px)',
    }"
  />
</template>
