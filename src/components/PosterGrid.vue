<template>
  <div class="pagina">
    <ul class="grid grid-cols-2 gap-x-3 gap-y-6 min-[480px]:grid-cols-3 sm:grid-cols-4 sm:gap-x-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      <li v-for="(filme, i) in filmes" :key="filme.id">
        <PosterCard :movie="filme" :eager="i < 6" />
      </li>
      <template v-if="carregando">
        <li v-for="n in filmes.length ? 6 : 12" :key="`s${n}`"><SkeletonPoster /></li>
      </template>
    </ul>
    <div ref="sentinela" class="h-px" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import PosterCard from "./PosterCard.vue";
import SkeletonPoster from "./ui/SkeletonPoster.vue";
import { useCarregarAoVer } from "../composables/useCarregarAoVer";
import type { Movie } from "../types/movie";

const props = defineProps<{ filmes: Movie[]; carregando: boolean; fim?: boolean }>();
const emit = defineEmits<{ (e: "mais"): void }>();

// Scroll infinito: pede a próxima página quando o fim da grade se aproxima da tela.
const sentinela = ref<HTMLElement | null>(null);
const visivel = ref(false);
useIntersectionObserver(sentinela, ([entrada]) => (visivel.value = entrada.isIntersecting), { rootMargin: "600px" });

useCarregarAoVer(
  visivel,
  { carregando: toRef(props, "carregando"), fim: toRef(props, "fim"), total: computed(() => props.filmes.length) },
  () => emit("mais")
);
</script>
