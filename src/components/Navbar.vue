<template>
  <div class="sticky top-0 z-50 shadow-md bg-zinc-800">
    <div
      class="flex flex-wrap items-center justify-between gap-4 px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8"
    >
      <!-- Botão Mobile -->
      <button
        @click="toggleMobileMenu"
        class="text-white sm:hidden focus:outline-none"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- Logo (opcional colocar nome aqui) -->
      <router-link to="/" class="hidden text-xl font-bold text-white sm:block">
        CineMatch
      </router-link>

      <!-- Menu Links -->
      <div
        :class="[
          'flex-col sm:flex-row sm:flex gap-6 text-sm sm:text-base',
          mobileMenuOpen ? 'flex w-full sm:w-auto' : 'hidden sm:flex',
        ]"
      >
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-white hover:underline"
          :class="{ 'text-indigo-400 font-semibold': isActiveRoute(link.to) }"
        >
          {{ link.label }}
        </router-link>
      </div>

      <!-- Search + Card Size -->
      <div
        ref="searchWrapper"
        class="relative flex-1 w-full sm:flex-none sm:w-auto"
      >
        <div class="relative z-10 flex items-center w-full gap-2">
          <input
            v-model="search"
            @keydown.enter="goToSearch"
            @input="debouncedFetch"
            type="text"
            placeholder="Buscar..."
            class="w-full p-2 text-white border rounded sm:w-64 border-zinc-600 bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <CardSizeToggle />
        </div>

        <!-- Gaveta de sugestões -->
        <div
          v-if="searching || suggestions.length"
          class="absolute left-0 z-40 w-full mt-1 overflow-hidden border rounded shadow-md top-full bg-zinc-800 border-zinc-700"
        >
          <div v-if="searching" class="p-3 text-sm text-center text-gray-400">
            Carregando...
          </div>
          <router-link
            v-for="movie in suggestions"
            :key="movie.id"
            :to="`/filme/${movie.id}`"
            class="flex items-center gap-2 p-2 transition hover:bg-zinc-700"
            @click="clearSuggestions"
          >
            <img
              :src="getPosterUrl(movie.poster_path)"
              alt="poster"
              class="object-cover w-10 rounded h-14"
            />
            <span class="truncate">{{ movie.title }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDebounceFn } from "@vueuse/core";
import { useMovies } from "../composables/useMovies";
import CardSizeToggle from "./CardSizeToggle.vue";

const router = useRouter();
const route = useRoute();
const { searchMovies } = useMovies();

const search = ref("");
const suggestions = ref<any[]>([]);
const searching = ref(false);
const searchWrapper = ref<HTMLElement | null>(null);
const mobileMenuOpen = ref(false);

const links = [
  { label: "Populares", to: "/" },
  { label: "Mais bem avaliados", to: "/top-rated" },
  { label: "Explorar", to: "/explorar" },
];

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
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
  window.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
});
</script>
