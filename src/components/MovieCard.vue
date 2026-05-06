<template>
  <article
    class="w-full overflow-hidden rounded-xl border border-app-border bg-app-surface shadow-md transition duration-300 hover:scale-[1.02] hover:shadow-xl"
    :class="{
      'max-w-[150px]': size === 'sm',
      'max-w-[200px]': size === 'md',
      'max-w-[300px]': size === 'lg',
    }"
  >
    <button
      type="button"
      class="w-full text-left"
      @click="$emit('select', movie)"
      :aria-label="`Abrir detalhes de ${movie.title}`"
    >
      <div class="aspect-[2/3] w-full bg-app-surfaceSoft">
        <img
          v-if="movie.poster_path"
          :src="`https://image.tmdb.org/t/p/w300${movie.poster_path}`"
          :alt="`Poster do filme ${movie.title}`"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="flex h-full items-center justify-center text-sm text-app-muted"
        >
          Sem poster
        </div>
      </div>
      <div class="space-y-1 p-3">
        <h2 class="truncate text-base font-semibold text-app-text sm:text-lg">
          {{ movie.title }}
        </h2>
        <p class="text-sm text-zinc-300">Nota: {{ movie.vote_average }}</p>
        <p class="truncate text-sm text-app-muted">
          Lançamento: {{ movie.release_date || "Sem data" }}
        </p>
      </div>
    </button>
  </article>
</template>

<script setup lang="ts">
defineProps<{ movie: any; size?: "sm" | "md" | "lg" }>();

defineEmits<{
  (event: "select", movie: any): void;
}>();
</script>
