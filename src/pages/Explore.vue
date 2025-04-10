<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useMovies } from "../composables/useMovies";
import { useMovieStore } from "../store/movieStore";
import MovieCard from "../components/MovieCard.vue";
import axios from "axios";

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

watch(selectedGenre, () => {
  fetchInitial();
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
  <div class="min-h-screen px-4 py-6 text-white bg-zinc-900 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div
        class="flex flex-col gap-4 pb-4 mb-6 border-b sm:flex-row sm:items-center sm:justify-between border-zinc-700"
      >
        <h1 class="text-3xl font-bold text-white">Explorar</h1>
        <div
          class="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:w-auto sm:justify-end"
        >
          <input
            v-model="search"
            type="text"
            placeholder="Buscar em todo o acervo..."
            class="w-full p-2 text-white border rounded border-zinc-700 bg-zinc-800 sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            v-model="selectedGenre"
            class="w-full p-2 text-white border rounded border-zinc-700 bg-zinc-800 sm:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos os gêneros</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">
              {{ genre.name }}
            </option>
          </select>
          <select
            v-model="selectedSort"
            class="w-full p-2 text-white border rounded border-zinc-700 bg-zinc-800 sm:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option
              v-for="option in sortOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="loading && currentPage === 1"
        class="py-10 text-center text-gray-400"
      >
        Carregando filmes...
      </div>
      <div
        v-else-if="movies.length === 0"
        class="py-10 text-center text-gray-400"
      >
        Nenhum filme encontrado.
      </div>

      <div
        v-else
        class="grid"
        :class="[
          store.cardSize === 'sm'
            ? 'grid-cols-[repeat(auto-fill,minmax(120px,1fr))] justify-items-center'
            : '',
          store.cardSize === 'md'
            ? 'grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-items-center'
            : '',
          store.cardSize === 'lg'
            ? 'grid-cols-[repeat(auto-fill,minmax(220px,1fr))] justify-items-center'
            : '',
          'gap-4 sm:gap-6 md:gap-8',
        ]"
      >
        <MovieCard
          v-for="movie in movies"
          :key="movie.id"
          :movie="movie"
          :size="store.cardSize"
        />
      </div>

      <div
        ref="loadMoreTrigger"
        class="flex items-center justify-center h-16 mt-6"
      >
        <svg
          v-if="loading && currentPage > 1"
          class="w-5 h-5 text-white animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
