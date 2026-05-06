<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useMovies } from "../composables/useMovies";
import MovieCard from "../components/MovieCard.vue";
import { useMovieStore } from "../store/movieStore";
import PageContainer from "../components/ui/PageContainer.vue";
import AppSpinner from "../components/ui/AppSpinner.vue";
import { getMovieGridClass } from "../utils/movieGrid";

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
  <PageContainer>
    <h1 class="app-section-title mb-6">Mais bem avaliados</h1>

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
      <AppSpinner v-if="loading && currentPage > 1" class="py-0" />
    </div>
  </PageContainer>
</template>
