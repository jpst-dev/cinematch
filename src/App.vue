<template>
  <div
    class="min-h-screen bg-zinc-900 text-white font-sans"
    @click="handleClickOutside"
  >
    <nav class="bg-zinc-800 shadow-md">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4"
      >
        <button
          @click="toggleMobileMenu"
          class="sm:hidden text-white focus:outline-none"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>

        <div
          :class="[
            'flex-col sm:flex-row sm:flex gap-6 text-sm sm:text-base',
            mobileMenuOpen ? 'flex' : 'hidden sm:flex',
          ]"
        >
          <router-link
            to="/"
            class="hover:underline"
            :class="{ 'text-indigo-400 font-semibold': isActiveRoute('/') }"
          >
            Populares
          </router-link>
          <router-link
            to="/top-rated"
            class="hover:underline"
            :class="{
              'text-indigo-400 font-semibold': isActiveRoute('/top-rated'),
            }"
          >
            Mais bem avaliados
          </router-link>
          <router-link
            to="/explorar"
            class="hover:underline"
            :class="{
              'text-indigo-400 font-semibold': isActiveRoute('/explorar'),
            }"
          >
            Explorar
          </router-link>
        </div>

        <div class="relative w-full sm:w-auto" ref="searchWrapper">
          <div class="flex items-center gap-2">
            <input
              v-model="search"
              @keydown.enter="goToSearch"
              @input="debouncedFetch"
              type="text"
              placeholder="Buscar..."
              class="p-2 w-full sm:w-64 border border-zinc-600 bg-zinc-900 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <CardSizeToggle />
          </div>

          <div
            v-if="searching || suggestions.length > 0"
            class="absolute left-0 z-50 bg-zinc-800 border border-zinc-700 w-full mt-1 rounded shadow-md overflow-hidden"
          >
            <div v-if="searching" class="text-sm text-center p-3 text-gray-400">
              Carregando...
            </div>
            <router-link
              v-for="movie in suggestions"
              :key="movie.id"
              :to="`/filme/${movie.id}`"
              class="flex items-center gap-2 p-2 hover:bg-zinc-700 transition"
              @click="clearSuggestions"
            >
              <img
                :src="getPosterUrl(movie.poster_path)"
                alt="poster"
                class="w-10 h-14 object-cover rounded"
              />
              <span class="truncate">{{ movie.title }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <router-view />

    <button
      v-show="showBackToTop"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg transition-opacity"
    >
      ↑ Topo
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDebounceFn } from "@vueuse/core";
import { useMovies } from "./composables/useMovies";
import CardSizeToggle from "./components/CardSizeToggle.vue";

const router = useRouter();
const route = useRoute();
const { searchMovies } = useMovies();

const showBackToTop = ref(false);
const search = ref("");
const suggestions = ref<any[]>([]);
const searching = ref(false);
const searchWrapper = ref<HTMLElement | null>(null);
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 400;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const getPosterUrl = (path: string | null) => {
  return path ? `https://image.tmdb.org/t/p/w200${path}` : "/placeholder.jpg";
};

const fetchSuggestions = async () => {
  if (!search.value.trim()) {
    suggestions.value = [];
    return;
  }
  searching.value = true;
  const data = await searchMovies(search.value);
  suggestions.value = data.slice(0, 6);
  searching.value = false;
};

const debouncedFetch = useDebounceFn(fetchSuggestions, 400);

const goToSearch = () => {
  if (!search.value.trim()) return;
  router.push({ path: "/buscar", query: { q: search.value } });
  clearSuggestions();
  search.value = "";
};

const clearSuggestions = () => {
  suggestions.value = [];
  searching.value = false;
};

const isActiveRoute = (path: string) => route.path === path;

const handleClickOutside = (e: MouseEvent) => {
  if (searchWrapper.value && !searchWrapper.value.contains(e.target as Node)) {
    clearSuggestions();
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
