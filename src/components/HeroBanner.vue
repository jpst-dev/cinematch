<template>
  <section
    class="relative h-[72vh] min-h-[480px] w-full overflow-hidden sm:h-[80vh] sm:max-h-[860px] sm:min-h-[560px]"
    aria-roledescription="carrossel"
    aria-label="Destaques em cartaz"
    @mouseenter="pausado = true"
    @mouseleave="pausado = false"
    @focusin="pausado = true"
    @focusout="pausado = false"
  >
    <div v-if="!destaques.length" class="absolute inset-0 animate-pulse bg-app-surface" aria-hidden="true"></div>

    <div
      v-for="(filme, i) in destaques"
      :key="filme.id"
      class="absolute inset-0 transition-opacity duration-1000"
      :class="i === atual ? 'opacity-100' : 'pointer-events-none opacity-0'"
      :aria-hidden="i !== atual"
      :inert="i !== atual"
      aria-roledescription="slide"
      :aria-label="`${i + 1} de ${destaques.length}: ${filme.title}`"
    >
      <img
        :src="IMG('w1280', filme.backdrop_path)!"
        alt=""
        class="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        :loading="i === 0 ? 'eager' : 'lazy'"
        :fetchpriority="i === 0 ? 'high' : 'low'"
      />
      <div class="sombra-lateral absolute inset-0"></div>
      <div class="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-app-bg via-app-bg/60 to-transparent sm:h-1/2"></div>

      <div class="pagina absolute inset-x-0 bottom-24 sm:bottom-32">
        <div class="max-w-xl">
          <p class="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-app-brand">
            <span class="h-1.5 w-1.5 rounded-full bg-app-brand"></span> Em cartaz
          </p>
          <h2
            class="font-display uppercase leading-[0.9] tracking-wide text-white"
            :class="filme.title.length > 22 ? 'text-5xl sm:text-6xl lg:text-7xl' : 'text-6xl sm:text-7xl lg:text-8xl'"
          >
            {{ filme.title }}
          </h2>
          <p class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-200">
            <span v-if="formatNota(filme.vote_average)" class="font-semibold text-app-brand">★ {{ formatNota(filme.vote_average) }}</span>
            <span v-if="ano(filme.release_date)">{{ ano(filme.release_date) }}</span>
            <span v-if="nomesGeneros(filme)">{{ nomesGeneros(filme) }}</span>
          </p>
          <p v-if="filme.overview" class="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-300 sm:line-clamp-3 sm:text-base">
            {{ filme.overview }}
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <router-link :to="`/filme/${filme.id}#trailer`" class="btn-primario">
              <Play class="h-4 w-4 fill-current" /> Ver trailer
            </router-link>
            <router-link :to="`/filme/${filme.id}`" class="btn-vidro">
              <Info class="h-4 w-4" /> Detalhes
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="destaques.length > 1" class="pagina absolute bottom-16 right-0 flex gap-2 sm:bottom-24">
      <button
        v-for="(filme, i) in destaques"
        :key="filme.id"
        type="button"
        class="h-1 rounded-full transition-all"
        :class="i === atual ? 'w-10 bg-app-brand' : 'w-5 bg-white/40 hover:bg-white/70'"
        :aria-label="`Mostrar destaque ${i + 1}: ${filme.title}`"
        :aria-current="i === atual ? 'true' : undefined"
        @click="irPara(i)"
      ></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useIntervalFn } from "@vueuse/core";
import { Play, Info } from "lucide-vue-next";
import { IMG } from "../services/tmdb";
import { ano, formatNota } from "../utils/format";
import { filmesDoHero } from "../utils/hero";
import type { Movie } from "../types/movie";

const props = defineProps<{ filmes: Movie[]; generos: Record<number, string> }>();

const destaques = computed(() => filmesDoHero(props.filmes));
const atual = ref(0);
const pausado = ref(false);

const nomesGeneros = (filme: Movie) =>
  (filme.genre_ids ?? [])
    .map((id) => props.generos[id])
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");

// Troca a cada 7s; pausa com o mouse ou o foco dentro do destaque.
const { pause, resume } = useIntervalFn(() => {
  if (!pausado.value && destaques.value.length > 1) atual.value = (atual.value + 1) % destaques.value.length;
}, 7000);

const irPara = (i: number) => {
  atual.value = i;
  pause();
  resume();
};
</script>

<style scoped>
.sombra-lateral {
  background: linear-gradient(90deg, #070707 0%, rgba(7, 7, 7, 0.85) 30%, rgba(7, 7, 7, 0) 65%);
}
@media (max-width: 639px) {
  .sombra-lateral {
    background: linear-gradient(90deg, rgba(7, 7, 7, 0.7) 0%, rgba(7, 7, 7, 0) 80%);
  }
}
</style>
