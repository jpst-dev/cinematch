<template>
  <header class="pagina pb-6 pt-24 sm:pt-28">
    <p v-if="subtitulo" class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-app-brand">
      {{ subtitulo }}
    </p>
    <h1 class="hyphens-auto break-words font-display text-5xl leading-none tracking-wide text-white sm:text-6xl">{{ titulo }}</h1>
    <div v-if="$slots.default" class="mt-5"><slot /></div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ titulo: string; subtitulo?: string }>();
</script>
