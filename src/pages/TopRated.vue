<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useMovies } from "../composables/useMovies";
import MovieCard from "../components/MovieCard.vue";
import { useMovieStore } from "../store/movieStore";

const store = useMovieStore();
const { getTopRatedMovies } = useMovies();

const movies = ref<any[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const fetchInitial = async () => {
  loading.value = true;
  const data = await getTopRatedMovies(1);
  movies.value = data;
  currentPage.value = 2;
  loading.value = false;
};

const loadMore = async () => {
  if (loading.value) return;
  loading.value = true;
  const data = await getTopRatedMovies(currentPage.value);
  const existingIds = new Set(movies.value.map((m) => m.id));
  const newMovies = data.filter((m: { id: number }) => !existingIds.has(m.id));
  movies.value.push(...newMovies);
  currentPage.value++;
  loading.value = false;
};

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
  fetchInitial();
  createObserver();
});
</script>

<template>
  <div class="min-h-screen px-4 py-6 text-white bg-zinc-900 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <h1 class="mb-6 text-3xl font-bold">Mais bem avaliados</h1>

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
          @mouseup="() => $router.push(`/filme/${movie.id}`)"
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
