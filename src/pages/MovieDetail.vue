<template>
  <div class="min-h-screen px-4 py-6 text-white bg-zinc-900 sm:px-6 lg:px-8">
    <div v-if="loading" class="py-10 text-center text-gray-400">
      Carregando detalhes do filme...
    </div>

    <div v-else-if="!movie" class="py-10 text-center text-red-400">
      Filme não encontrado.
    </div>

    <div v-else class="mx-auto space-y-12 max-w-7xl">
      <!-- Detalhes principais -->
      <div
        class="flex flex-col gap-8 p-6 rounded-lg shadow-lg md:flex-row bg-zinc-800"
      >
        <img
          :src="`https://image.tmdb.org/t/p/w400${movie.poster_path}`"
          :alt="movie.title"
          class="w-full md:w-[300px] max-h-[460px] rounded-lg shadow-md object-cover"
        />
        <div class="flex flex-col flex-1">
          <div class="flex-1 space-y-4">
            <h1 class="text-3xl font-bold">{{ movie.title }}</h1>
            <p class="text-sm text-zinc-400">
              {{ movie.release_date }} • {{ movie.runtime }} min
            </p>
            <p class="text-sm text-zinc-300">Nota: {{ movie.vote_average }}</p>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="genre in movie.genres"
                :key="genre.id"
                class="px-3 py-1 text-xs text-white bg-indigo-600 rounded-full"
              >
                {{ genre.name }}
              </span>
            </div>

            <div
              v-if="director || writer"
              class="space-y-1 text-sm text-zinc-400"
            >
              <p v-if="director">
                <span class="text-zinc-300">Diretor:</span> {{ director }}
              </p>
              <p v-if="writer">
                <span class="text-zinc-300">Roteiro:</span> {{ writer }}
              </p>
            </div>

            <p class="mt-4 leading-relaxed text-zinc-200">
              {{ movie.overview }}
            </p>
          </div>

          <!-- Onde assistir -->
          <div
            v-if="watchProviders?.flatrate?.length"
            class="flex flex-wrap items-center gap-2 pt-4 mt-auto border-t border-zinc-700"
          >
            <span class="text-sm text-zinc-400">Disponível em:</span>
            <a
              v-for="provider in watchProviders.flatrate"
              :key="provider.provider_id"
              :href="watchProviders.link"
              target="_blank"
              rel="noopener noreferrer"
              class="transition-transform hover:scale-110"
            >
              <img
                :src="`https://image.tmdb.org/t/p/w45${provider.logo_path}`"
                :alt="provider.provider_name"
                class="w-8 h-8 rounded"
                :title="provider.provider_name"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- Trailer -->
      <div
        v-if="trailerUrl"
        class="w-full overflow-hidden rounded-lg shadow-lg aspect-video"
      >
        <iframe
          :src="trailerUrl"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
          class="w-full h-full"
        ></iframe>
      </div>

      <!-- Elenco -->
      <section v-if="cast.length" class="space-y-4">
        <h2 class="pb-2 text-xl font-semibold border-b border-zinc-700">
          Elenco principal
        </h2>
        <div
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          <div
            v-for="actor in cast"
            :key="actor.id"
            class="p-3 text-center transition rounded-lg shadow bg-zinc-800 hover:shadow-md"
          >
            <img
              v-if="actor.profile_path"
              :src="`https://image.tmdb.org/t/p/w185${actor.profile_path}`"
              :alt="actor.name"
              class="w-full h-[240px] object-cover rounded mb-2"
            />
            <div
              v-else
              class="w-full h-[240px] bg-zinc-700 rounded mb-2 flex items-center justify-center text-sm text-zinc-400"
            >
              Sem imagem
            </div>
            <h3 class="text-sm font-semibold truncate">{{ actor.name }}</h3>
            <p class="text-xs truncate text-zinc-400">
              como {{ actor.character }}
            </p>
          </div>
        </div>
      </section>

      <!-- Recomendados -->
      <section v-if="recommendations.length" class="mt-10 space-y-6">
        <h2 class="text-xl font-bold text-white">Filmes recomendados</h2>

        <div class="relative">
          <Carousel
            :items-to-show="getItemsToShow"
            :items-to-scroll="getItemsToShow"
            :breakpoints="{
              480: { itemsToShow: 2, itemsToScroll: 2 },
              640: { itemsToShow: 4, itemsToScroll: 4 },
              768: { itemsToShow: 5, itemsToScroll: 5 },
              1024: { itemsToShow: 6, itemsToScroll: 6 },
              1280: { itemsToShow: 7, itemsToScroll: 7 },
            }"
            :loop="true"
            :wrap-around="true"
            :mouse-drag="true"
            :pause-autoplay-on-hover="true"
            :autoplay="5000"
            :mouse-wheel="true"
            class="w-full"
          >
            <Slide
              v-for="rec in recommendations"
              :key="rec.id"
              class="cursor-pointer"
              @mousedown="isDragging = false"
              @mousemove="isDragging = true"
              @mouseup="
                () => {
                  if (!isDragging) {
                    $router.push(`/filme/${rec.id}`);
                  }
                }
              "
            >
              <MovieCard :movie="rec" size="sm" />
            </Slide>

            <template #addons>
              <Navigation />
            </template>
          </Carousel>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Carousel, Slide, Navigation } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import { useMovieStore } from "../store/movieStore";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useMovieDetail } from "../composables/useMovieDetail";
import MovieCard from "../components/MovieCard.vue";
import { computed } from "vue";
import { watch } from "vue";

// Estado
const route = useRoute();
const store = useMovieStore();
const {
  getMovieDetails,
  getVideos,
  getCredits,
  getRecommendations,
  getWatchProviders,
} = useMovieDetail();
const movie = ref<any>(null);
const loading = ref(true);
const trailerUrl = ref<string | null>(null);
const cast = ref<any[]>([]);
const recommendations = ref<any[]>([]);
const director = ref<string | null>(null);
const writer = ref<string | null>(null);
const watchProviders = ref<any | null>(null);
const isDragging = ref(false);

import { useWindowSize } from "@vueuse/core";

const { width } = useWindowSize();

const getItemsToShow = computed(() => {
  if (width.value < 380) return 2;
  if (width.value < 640) return 3;
  if (width.value < 768) return 4;
  if (width.value < 1024) return 5;
  if (store.cardSize === "lg") return 7;
  if (store.cardSize === "md") return 8;
  return 9;
});

watch(
  () => route.params.id,
  async (newId) => {
    if (!newId) return;
    await fetchMovieDetails(newId as string);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
);

const fetchMovieDetails = async (id: string) => {
  try {
    loading.value = true;
    movie.value = await getMovieDetails(id);

    const credits = await getCredits(id);
    cast.value = credits.cast.slice(0, 12);
    director.value =
      credits.crew.find((c: any) => c.job === "Director")?.name || null;
    writer.value =
      credits.crew.find((c: any) =>
        ["Screenplay", "Writer", "Author"].includes(c.job)
      )?.name || null;

    const recs = await getRecommendations(id);
    recommendations.value = recs.slice(0, 10);

    const providers = await getWatchProviders(id);
    watchProviders.value = providers || null;

    const videos = await getVideos(id);
    const trailer = videos.find(
      (v: any) => v.type === "Trailer" && v.site === "YouTube" && v.key
    );
    trailerUrl.value = trailer
      ? `https://www.youtube.com/embed/${trailer.key}`
      : null;
  } catch (err) {
    console.error("Erro ao carregar detalhes do filme:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  const id = route.params.id as string;
  fetchMovieDetails(id);
});
</script>

<style>
.carousel__slide {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.carousel__prev,
.carousel__next {
  background-color: rgba(63, 63, 70, 0.8); /* bg-zinc-700/80 */
  border-radius: 9999px;
  width: 36px;
  height: 36px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.carousel__prev:hover,
.carousel__next:hover {
  background-color: rgba(99, 102, 241, 0.7); /* hover:bg-indigo-500/70 */
}
</style>
