<template>
  <div>
    <PageHeader titulo="Explorar" subtitulo="Descubra por gênero e ordem">
      <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label class="relative">
          <span class="sr-only">Buscar filmes</span>
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
          <input v-model="termo" type="search" placeholder="Buscar filmes" class="app-input pl-9" />
        </label>
        <label>
          <span class="sr-only">Gênero</span>
          <select v-model="genero" class="app-select sm:w-52" :disabled="buscando" :title="buscando ? 'A busca ignora os filtros' : undefined">
            <option value="">Todos os gêneros</option>
            <option v-for="g in generos" :key="g.id" :value="String(g.id)">{{ g.name }}</option>
          </select>
        </label>
        <label>
          <span class="sr-only">Ordenar por</span>
          <select v-model="ordem" class="app-select sm:w-52" :disabled="buscando" :title="buscando ? 'A busca ignora os filtros' : undefined">
            <option v-for="o in ordens" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
      </div>
    </PageHeader>
    <PosterGrid :filmes="filmes" :carregando="carregando" :fim="fim || erro" @mais="carregarMais" />
    <EstadoLista :erro="erro" :vazio="!carregando && !erro && !filmes.length" @tentar="carregarMais" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import { Search } from "lucide-vue-next";
import PageHeader from "../components/PageHeader.vue";
import PosterGrid from "../components/PosterGrid.vue";
import EstadoLista from "../components/EstadoLista.vue";
import { useMovies } from "../composables/useMovies";
import { useListaPaginada } from "../composables/useListaPaginada";

const ordens = [
  { label: "Nota (maior)", value: "vote_average.desc" },
  { label: "Nota (menor)", value: "vote_average.asc" },
  { label: "Popularidade (maior)", value: "popularity.desc" },
  { label: "Popularidade (menor)", value: "popularity.asc" },
  { label: "Mais recentes", value: "primary_release_date.desc" },
  { label: "Mais antigos", value: "primary_release_date.asc" },
];

const { searchMovies, getMoviesWithFilters, getGenres } = useMovies();

const termo = ref("");
const genero = ref("");
const ordem = ref("popularity.desc");
const generos = ref<{ id: number; name: string }[]>([]);
const buscando = computed(() => termo.value.trim() !== "");

// Com texto, busca por título; sem texto, usa gênero e ordem.
const { filmes, carregando, erro, fim, carregarMais, recarregar } = useListaPaginada((pagina) =>
  buscando.value
    ? searchMovies(termo.value.trim(), pagina)
    : getMoviesWithFilters({ genreId: genero.value, sortBy: ordem.value, page: pagina })
);

watch([genero, ordem], recarregar);
watchDebounced(termo, recarregar, { debounce: 450 });

onMounted(() => {
  getGenres()
    .then((mapa) => (generos.value = Object.entries(mapa).map(([id, name]) => ({ id: Number(id), name }))))
    .catch(() => {});
  carregarMais();
});
</script>
