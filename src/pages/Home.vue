<template>
  <PageContainer>
    <section v-if="nowPlayingMovies.length" class="app-panel mb-10 p-4 sm:p-6">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="app-section-title">Em cartaz</h2>
        <span class="text-sm text-app-muted">Atualizado diariamente</span>
      </div>
      <Carousel
        :items-to-show="responsiveItemsToShow"
        :items-to-scroll="responsiveItemsToShow"
        :breakpoints="{
          0: { itemsToShow: 1, itemsToScroll: 1 },
          380: { itemsToShow: 2, itemsToScroll: 2 },
          768: { itemsToShow: 3, itemsToScroll: 3 },
          1024: { itemsToShow: 4, itemsToScroll: 4 },
          1280: { itemsToShow: 5, itemsToScroll: 5 },
        }"
        :loop="true"
        :wrap-around="true"
        :mouse-drag="true"
        :pause-autoplay-on-hover="true"
        :gap="10"
        :autoplay="5000"
        :mouse-wheel="true"
        class="w-full"
      >
        <Slide
          v-for="movie in nowPlayingMovies"
          :key="movie.id"
          @mousedown="isDragging = false"
          @mousemove="isDragging = true"
          @mouseup="
            () => {
              if (!isDragging) $router.push(`/filme/${movie.id}`);
            }
          "
        >
          <MovieCard
            :movie="movie"
            :size="store.cardSize"
            class="h-full w-full"
            @select="$router.push(`/filme/${movie.id}`)"
          />
        </Slide>
        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </section>

    <AppSpinner v-if="loading && currentPage === 1" label="Carregando filmes..." />

    <div
      v-else-if="Array.isArray(filteredMovies) && filteredMovies.length === 0"
      class="py-10 text-center text-app-muted"
    >
      Nenhum filme encontrado.
    </div>

    <div v-else :class="getMovieGridClass(store.cardSize)">
      <MovieCard
        v-for="movie in filteredMovies"
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

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useWindowSize } from "@vueuse/core";
import { useMovies } from "../composables/useMovies";
import { useMovieStore } from "../store/movieStore";
import MovieCard from "../components/MovieCard.vue";
import PageContainer from "../components/ui/PageContainer.vue";
import AppSpinner from "../components/ui/AppSpinner.vue";
import { Carousel, Slide, Navigation } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import { getMovieGridClass } from "../utils/movieGrid";

const store = useMovieStore();
const { getPopularMovies, getNowPlayingMovies, searchMovies } = useMovies();
const nowPlayingMovies = ref<any[]>([]);
const isDragging = ref(false);

const { width } = useWindowSize();

const responsiveItemsToShow = computed(() => {
  if (width.value < 480) return 2;
  if (width.value < 768) return 3;
  if (width.value < 1024) return 4;
  if (store.cardSize === "lg") return 5;
  if (store.cardSize === "md") return 6;
  return 7;
});


const fetchNowPlaying = async () => {
  nowPlayingMovies.value = await getNowPlayingMovies(1);
};

const movies = computed(() => store.movies);
const filteredMovies = computed(() => movies.value);
const loading = computed(() => store.isLoading);
const currentPage = computed(() => store.currentPage);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const fetchInitial = async () => {
  store.setLoading(true);
  const data = await getPopularMovies(1);
  store.setMovies(data);
  store.setPage(2);
  store.setSearchMode(false);
  store.setLoading(false);
};

const loadMore = async () => {
  if (loading.value) return;
  store.setLoading(true);
  const page = store.currentPage;
  let data;
  if (store.isSearchMode) {
    data = await searchMovies(store.query, page);
  } else {
    data = await getPopularMovies(page);
  }
  store.appendMovies(data);
  store.setPage(page + 1);
  store.setLoading(false);
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
  fetchNowPlaying();
  createObserver();
});
</script>
