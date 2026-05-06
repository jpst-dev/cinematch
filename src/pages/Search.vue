<template>
  <PageContainer>
    <header class="app-panel mb-6 p-4 sm:p-5">
      <h1 class="app-section-title mb-3">Resultados da busca</h1>
      <AppInput
        v-model="query"
        placeholder="Buscar filmes..."
        input-class="max-w-xl"
      />
    </header>

    <AppSpinner v-if="loading && movies.length === 0" />

    <div v-else-if="movies.length === 0" class="py-10 text-center text-app-muted">
      Nenhum resultado encontrado.
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
      <AppSpinner v-if="loading && movies.length > 0" class="py-0" />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useDebounceFn } from "@vueuse/core";
import { useMovies } from "../composables/useMovies";
import { useMovieStore } from "../store/movieStore";
import MovieCard from "../components/MovieCard.vue";
import PageContainer from "../components/ui/PageContainer.vue";
import AppInput from "../components/ui/AppInput.vue";
import AppSpinner from "../components/ui/AppSpinner.vue";
import { getMovieGridClass } from "../utils/movieGrid";

const { searchMovies } = useMovies();
const store = useMovieStore();
const route = useRoute();

const query = ref(typeof route.query.q === "string" ? route.query.q : "");
const movies = ref<any[]>([]);
const page = ref(1);
const loading = ref(false);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const search = async (reset = false) => {
  if (!query.value) {
    movies.value = [];
    return;
  }
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
