<template>
  <section v-if="carregando || filmes.length" class="relative" :aria-label="titulo">
    <div class="pagina mb-3 flex items-end justify-between gap-4">
      <h2 class="text-lg font-semibold text-white sm:text-xl">{{ titulo }}</h2>
      <router-link
        v-if="verTudo"
        :to="verTudo"
        class="shrink-0 text-sm text-app-muted transition hover:text-app-brand"
      >
        Ver tudo →
      </router-link>
    </div>
    <div class="group/row relative">
      <button
        type="button"
        class="seta left-0 bg-gradient-to-r"
        aria-label="Rolar fileira para a esquerda"
        @click="rolar(-1)"
      >
        <ChevronLeft class="h-7 w-7" />
      </button>
      <ul
        ref="trilho"
        class="pagina scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4"
      >
        <template v-if="carregando && !filmes.length">
          <li v-for="n in 8" :key="n" class="item"><SkeletonPoster /></li>
        </template>
        <li v-for="filme in filmes" :key="filme.id" class="item">
          <PosterCard :movie="filme" />
        </li>
      </ul>
      <button
        type="button"
        class="seta right-0 bg-gradient-to-l"
        aria-label="Rolar fileira para a direita"
        @click="rolar(1)"
      >
        <ChevronRight class="h-7 w-7" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import PosterCard from "./PosterCard.vue";
import SkeletonPoster from "./ui/SkeletonPoster.vue";
import type { Movie } from "../types/movie";

withDefaults(defineProps<{ titulo: string; filmes: Movie[]; verTudo?: string; carregando?: boolean }>(), {
  carregando: false,
});

const trilho = ref<HTMLElement | null>(null);

const rolar = (direcao: 1 | -1) => {
  const el = trilho.value;
  if (el) el.scrollBy({ left: direcao * el.clientWidth * 0.8 });
};
</script>

<style scoped>
.item {
  @apply w-32 shrink-0 snap-start sm:w-40 lg:w-44;
  scroll-margin-left: 1rem;
}
.seta {
  @apply absolute inset-y-0 z-10 hidden w-12 items-center justify-center from-app-bg/95 to-transparent pb-10 text-white opacity-0 transition hover:text-app-brand focus-visible:opacity-100 group-hover/row:opacity-100 md:flex;
}
</style>
