<template>
  <div class="min-h-screen bg-zinc-900 text-white p-6">
    <input
      v-model="query"
      type="text"
      placeholder="Buscar filmes..."
      class="w-full max-w-lg mb-4 p-2 border border-zinc-700 bg-zinc-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />

    <div
      v-if="loading && movies.length === 0"
      class="text-center py-10 text-gray-400"
    >
      Carregando...
    </div>
    <div
      v-else-if="movies.length === 0"
      class="text-center py-10 text-gray-400"
    >
      Nenhum resultado encontrado.
    </div>

    <div
      class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 sm:gap-6 md:gap-8"
    >
      <MovieCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
        size="md"
        @mouseup="() => $router.push(`/filme/${movie.id}`)"
      />
    </div>

    <div
      ref="loadMoreTrigger"
      class="h-16 mt-6 flex items-center justify-center"
    >
      <svg
        v-if="loading && movies.length > 0"
        class="animate-spin h-5 w-5 text-white"
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
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useDebounceFn } from "@vueuse/core";
import { useMovies } from "../composables/useMovies";
import MovieCard from "../components/MovieCard.vue";

const { searchMovies } = useMovies();
const route = useRoute();

const query = ref(typeof route.query.q === "string" ? route.query.q : "");
const movies = ref<any[]>([]);
const page = ref(1);
const loading = ref(false);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const search = async (reset = false) => {
  if (!query.value) return;
  loading.value = true;
  const results = await searchMovies(query.value, page.value);
  if (reset) {
    movies.value = results;
  } else {
    const existingIds = new Set(movies.value.map((m) => m.id));
    const newMovies = results.filter(
      (m: { id: string }) => !existingIds.has(m.id)
    );
    movies.value.push(...newMovies);
  }
  page.value++;
  loading.value = false;
};

const debouncedSearch = useDebounceFn(() => {
  page.value = 1;
  search(true);
}, 500);

watch(query, () => {
  debouncedSearch();
});

const createObserver = () => {
  if (!loadMoreTrigger.value) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        search();
      }
    },
    {
      rootMargin: "100px",
    }
  );
  observer.observe(loadMoreTrigger.value);
};

onMounted(() => {
  search(true);
  createObserver();
});
</script>
