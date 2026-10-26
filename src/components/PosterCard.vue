<template>
  <router-link :to="`/filme/${movie.id}`" class="group block">
    <div class="relative aspect-[2/3] overflow-hidden rounded-md bg-app-surfaceSoft ring-1 ring-white/5">
      <img
        v-if="poster"
        :src="poster"
        :alt="`Pôster de ${movie.title}`"
        :loading="eager ? 'eager' : 'lazy'"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div
        v-else
        class="flex h-full items-center justify-center p-3 text-center font-display text-2xl leading-none tracking-wide text-app-muted"
      >
        {{ movie.title }}
      </div>
      <span
        v-if="nota"
        class="absolute left-2 top-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-app-brand backdrop-blur"
      >
        ★ {{ nota }}
      </span>
      <div
        class="pointer-events-none absolute inset-0 rounded-md ring-2 ring-inset ring-app-brand/0 transition group-hover:ring-app-brand/70"
      ></div>
    </div>
    <p class="mt-2 truncate text-sm font-medium text-app-text transition group-hover:text-app-brand">
      {{ movie.title }}
    </p>
    <p v-if="anoLancamento" class="text-xs text-app-muted">{{ anoLancamento }}</p>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IMG } from "../services/tmdb";
import { ano, formatNota } from "../utils/format";
import type { Movie } from "../types/movie";

const props = defineProps<{ movie: Movie; eager?: boolean }>();

const poster = computed(() => IMG("w342", props.movie.poster_path));
const nota = computed(() => formatNota(props.movie.vote_average));
const anoLancamento = computed(() => ano(props.movie.release_date));
</script>
