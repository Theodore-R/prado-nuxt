<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

navigateTo('/espace', { redirectCode: 302 })
</script>

<template>
  <div class="flex items-center justify-center py-32">
    <p class="text-prado-text-muted text-sm">Redirection...</p>
  </div>
</template>
