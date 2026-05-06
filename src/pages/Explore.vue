<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useMovies } from "../composables/useMovies";
import { useMovieStore } from "../store/movieStore";
import MovieCard from "../components/MovieCard.vue";
import PageContainer from "../components/ui/PageContainer.vue";
import AppInput from "../components/ui/AppInput.vue";
import AppSelect from "../components/ui/AppSelect.vue";
import AppSpinner from "../components/ui/AppSpinner.vue";
import axios from "axios";
import { getMovieGridClass } from "../utils/movieGrid";

const sortOptions = [
  { label: "Nota (maior)", value: "vote_average.desc" },
  { label: "Nota (menor)", value: "vote_average.asc" },
  { label: "Popularidade (maior)", value: "popularity.desc" },
  { label: "Popularidade (menor)", value: "popularity.asc" },
  { label: "Mais recentes", value: "primary_release_date.desc" },
  { label: "Mais antigos", value: "primary_release_date.asc" },
];
const selectedSort = ref("vote_average.desc");

const store = useMovieStore();
const { searchMovies, getMoviesWithFilters } = useMovies();

const search = ref("");
const movies = ref<any[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const loadMoreTrigger = ref<HTMLElement | null>(null);
const isSearching = ref(false);

const genres = ref<any[]>([]);
const selectedGenre = ref("");

const fetchGenres = async () => {
  const res = await axios.get("https://api.themoviedb.org/3/genre/movie/list", {
    params: { api_key: import.meta.env.VITE_TMDB_API_KEY, language: "pt-BR" },
  });
  genres.value = res.data.genres;
};

const fetchInitial = async () => {
  loading.value = true;
  const data = await getMoviesWithFilters({
    genreId: selectedGenre.value,
    sortBy: selectedSort.value,
    page: 1,
  });
  movies.value = data;
  currentPage.value = 2;
  loading.value = false;
  isSearching.value = false;
};

const loadMore = async () => {
  if (loading.value || isSearching.value) return;
  loading.value = true;
  const data = await getMoviesWithFilters({
    genreId: selectedGenre.value,
    sortBy: selectedSort.value,
    page: currentPage.value,
  });
  const existingIds = new Set(movies.value.map((m) => m.id));
  const newMovies = data.filter((m: { id: number }) => !existingIds.has(m.id));
  movies.value.push(...newMovies);
  currentPage.value++;
  loading.value = false;
};

watch([selectedGenre, selectedSort], () => {
  fetchInitial();
});

const handleSearch = useDebounceFn(async () => {
  if (search.value.trim() === "") {
    fetchInitial();
    return;
  }
  loading.value = true;
  isSearching.value = true;
  const data = await searchMovies(search.value, 1);
  movies.value = data;
  currentPage.value = 2;
  loading.value = false;
}, 500);

watch(search, () => {
  handleSearch();
});

const createObserver = () => {
  if (!loadMoreTrigger.value) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    },
    {
      rootMargin: "100px",
    }
  );
  observer.observe(loadMoreTrigger.value);
};

onMounted(() => {
  fetchGenres();
  fetchInitial();
  createObserver();
});
</script>

<template>
  <PageContainer>
    <header class="app-panel mb-6 p-4 sm:p-5">
      <div class="mb-4 flex items-center justify-between border-b border-app-border pb-3">
        <h1 class="app-section-title">Explorar</h1>
        <span class="text-sm text-app-muted">Descubra por filtros</span>
      </div>

      <div class="grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <AppInput
          v-model="search"
          placeholder="Buscar em todo o acervo..."
          input-class="md:min-w-72"
        />
        <AppSelect v-model="selectedGenre" select-class="md:min-w-56">
          <option value="">Todos os gêneros</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre.id">
            {{ genre.name }}
          </option>
        </AppSelect>
        <AppSelect v-model="selectedSort" select-class="md:min-w-56">
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </AppSelect>
      </div>
    </header>

    <AppSpinner v-if="loading && currentPage === 1" label="Carregando filmes..." />

    <div v-else-if="movies.length === 0" class="py-10 text-center text-app-muted">
      Nenhum filme encontrado.
    </div>

    <div v-else :class="getMovieGridClass(store.cardSize)">
      <MovieCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
        :size="store.cardSize"
        @select="$router.push(`/filme/${movie.id}`)"
      />
    </div>

    <div ref="loadMoreTrigger" class="mt-6 flex h-16 items-center justify-center">
      <AppSpinner
        v-if="loading && currentPage > 1"
        class="py-0"
        label="Buscando mais filmes..."
      />
    </div>
  </PageContainer>
</template>
