<template>
  <div class="min-h-screen px-4 py-6 text-white bg-zinc-900 sm:px-6 lg:px-8">
    <section
      v-if="nowPlayingMovies.length"
      class="flex flex-col items-center p-4 mb-10 rounded-lg shadow-lg bg-zinc-800"
      :class="store.cardSize === 'sm' ? 'max-w-7xl mx-auto' : ''"
    >
      <h2 class="mb-4 text-2xl font-bold text-center text-gray-200">
        <span class="animate-pulse">🎬</span> Em Cartaz
      </h2>
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
            class="w-full h-full"
          />
        </Slide>
        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </section>
    <div class="mx-auto max-w-7xl">
      <div
        v-if="loading && currentPage === 1"
        class="py-10 text-center text-gray-400"
      >
        Carregando filmes...
      </div>
      <div
        v-else-if="Array.isArray(filteredMovies) && filteredMovies.length === 0"
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
          v-for="movie in filteredMovies"
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

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useDebounceFn, useWindowSize } from "@vueuse/core";
import { useMovies } from "../composables/useMovies";
import { useMovieStore } from "../store/movieStore";
import MovieCard from "../components/MovieCard.vue";
import { Carousel, Slide, Navigation } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import axios from "axios";

const search = ref("");
const minRating = ref(0);
const store = useMovieStore();
const { getPopularMovies, searchMovies } = useMovies();
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

const getNowPlayingMovies = async (page = 1) => {
  const { data } = await axios.get(
    "https://api.themoviedb.org/3/movie/now_playing",
    {
      params: {
        api_key: import.meta.env.VITE_TMDB_API_KEY,
        language: "pt-BR",
        page,
      },
    }
  );
  return data.results;
};

const fetchNowPlaying = async () => {
  nowPlayingMovies.value = await getNowPlayingMovies(1);
};

const movies = computed(() => store.movies);
const filteredMovies = computed(() =>
  movies.value.filter((m) => m.vote_average >= minRating.value)
);
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

const handleSearch = useDebounceFn(async () => {
  store.setLoading(true);
  if (search.value.trim() === "") {
    await fetchInitial();
    return;
  }
  const data = await searchMovies(search.value, 1);
  store.setMovies(data);
  store.setPage(2);
  store.setSearchMode(true, search.value);
  store.setLoading(false);
}, 500);

watch(search, () => {
  handleSearch();
});

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

<style>
.carousel__slide {
  display: block;
  opacity: var(--carousel-opacity-inactive);
  transform: translateX(10px) rotateY(-12deg) scale(0.9);
  transition: transform 0.3s ease, opacity 0.3s ease;
  justify-items: center;
}

.carousel__pagination-button {
  background-color: #3f3f46; /* zinc-700 */
  opacity: 0.6;
}
.carousel__pagination-button--active {
  background-color: #6366f1; /* indigo-500 */
  opacity: 1;
}
</style>
