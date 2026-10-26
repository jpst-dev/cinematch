<template>
  <div>
    <h1 class="sr-only">CineMatch: filmes em cartaz, em alta e mais bem avaliados</h1>
    <HeroBanner v-if="emCartaz.carregando || emCartaz.filmes.length" :filmes="emCartaz.filmes" :generos="generos" />
    <EstadoLista v-else-if="tudoFalhou" class="pt-24" erro @tentar="carregar" />

    <div class="relative z-10 space-y-10 sm:space-y-12" :class="emCartaz.filmes.length ? '-mt-12 sm:-mt-20' : 'pt-24'">
      <MovieRow
        v-for="fileira in fileiras"
        :key="fileira.titulo"
        :titulo="fileira.titulo"
        :ver-tudo="fileira.verTudo"
        :filmes="fileira.estado.filmes"
        :carregando="fileira.estado.carregando"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import HeroBanner from "../components/HeroBanner.vue";
import MovieRow from "../components/MovieRow.vue";
import EstadoLista from "../components/EstadoLista.vue";
import { useMovies } from "../composables/useMovies";
import type { Movie } from "../types/movie";

const { getNowPlayingMovies, getPopularMovies, getTopRatedMovies, getGenres } = useMovies();

type Estado = { filmes: Movie[]; carregando: boolean; erro: boolean };
const novoEstado = () => reactive<Estado>({ filmes: [], carregando: true, erro: false });

const emCartaz = novoEstado();
const emAlta = novoEstado();
const avaliados = novoEstado();
const generos = ref<Record<number, string>>({});

const fileiras = [
  { titulo: "Em cartaz", verTudo: "/em-cartaz", estado: emCartaz },
  { titulo: "Em alta", verTudo: "/em-alta", estado: emAlta },
  { titulo: "Mais bem avaliados", verTudo: "/top-rated", estado: avaliados },
];

const tudoFalhou = computed(() => emCartaz.erro && emAlta.erro && avaliados.erro);

const preencher = async (estado: Estado, buscar: () => Promise<Movie[]>) => {
  estado.carregando = true;
  estado.erro = false;
  try {
    estado.filmes = await buscar();
  } catch {
    estado.erro = true;
  } finally {
    estado.carregando = false;
  }
};

const carregar = () => {
  getGenres()
    .then((g) => (generos.value = g))
    .catch(() => {});
  preencher(emCartaz, () => getNowPlayingMovies(1));
  preencher(emAlta, () => getPopularMovies(1));
  preencher(avaliados, () => getTopRatedMovies(1));
};

onMounted(carregar);
</script>
