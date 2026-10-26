<template>
  <div>
    <PageHeader :titulo="titulo" :subtitulo="subtitulo" />
    <PosterGrid :filmes="filmes" :carregando="carregando" :fim="fim || erro" @mais="carregarMais" />
    <EstadoLista :erro="erro" :vazio="!carregando && !erro && !filmes.length" @tentar="carregarMais" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import PageHeader from "../components/PageHeader.vue";
import PosterGrid from "../components/PosterGrid.vue";
import EstadoLista from "../components/EstadoLista.vue";
import { useMovies } from "../composables/useMovies";
import { useListaPaginada } from "../composables/useListaPaginada";
import type { Movie } from "../types/movie";

// Em cartaz, Em alta e Mais bem avaliados: mesma página, muda só a fonte (ver router).
type Fonte = "em-cartaz" | "em-alta" | "mais-bem-avaliados";

const props = defineProps<{ titulo: string; subtitulo?: string; fonte: Fonte }>();

const { getNowPlayingMovies, getPopularMovies, getTopRatedMovies } = useMovies();
const buscar: Record<Fonte, (pagina: number) => Promise<Movie[]>> = {
  "em-cartaz": getNowPlayingMovies,
  "em-alta": getPopularMovies,
  "mais-bem-avaliados": getTopRatedMovies,
};

const { filmes, carregando, erro, fim, carregarMais } = useListaPaginada(buscar[props.fonte]);

onMounted(carregarMais);
</script>
