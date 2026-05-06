<template>
  <header class="sticky top-0 z-50 border-b border-app-border/80 bg-app-bg/95 backdrop-blur">
    <div class="app-page py-3">
      <div class="app-page-inner">
        <div class="app-panel px-3 py-3 sm:px-4">
          <div class="flex items-center justify-between gap-3">
            <router-link to="/" class="text-lg font-bold tracking-tight text-app-text">
              CineMatch
            </router-link>

            <button
              @click="toggleMobileMenu"
              class="app-button-ghost sm:hidden"
              type="button"
              :aria-expanded="mobileMenuOpen"
              aria-label="Abrir menu de navegação"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <nav class="hidden items-center gap-2 sm:flex">
              <router-link
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="rounded-md px-3 py-2 text-sm font-medium transition"
                :class="
                  isActiveRoute(link.to)
                    ? 'bg-app-brand/20 text-indigo-300'
                    : 'text-app-muted hover:bg-app-surfaceSoft hover:text-app-text'
                "
              >
                {{ link.label }}
              </router-link>
            </nav>
          </div>

          <div class="relative mt-3" ref="searchWrapper">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <AppInput
                v-model="search"
                @enter="goToSearch"
                @input="debouncedFetch"
                placeholder="Buscar filme, ator ou palavra-chave..."
                input-class="sm:max-w-lg"
              />
              <div class="flex items-center justify-between gap-2 sm:ml-auto">
                <AppButton button-class="px-3 py-2" @click="goToSearch">Buscar</AppButton>
                <CardSizeToggle />
              </div>
            </div>

            <div
              v-if="searching || suggestions.length"
              class="app-panel absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden"
            >
              <div v-if="searching" class="p-3 text-center text-sm text-app-muted">
                Carregando sugestões...
              </div>
              <router-link
                v-for="movie in suggestions"
                :key="movie.id"
                :to="`/filme/${movie.id}`"
                class="flex items-center gap-3 border-b border-app-border/60 p-3 transition last:border-b-0 hover:bg-app-surfaceSoft"
                @click="clearSuggestions"
              >
                <img
                  :src="getPosterUrl(movie.poster_path)"
                  alt="Poster do filme"
                  class="h-14 w-10 rounded object-cover"
                />
                <span class="truncate text-sm">{{ movie.title }}</span>
              </router-link>
            </div>
          </div>

          <nav v-if="mobileMenuOpen" class="mt-3 grid gap-1 border-t border-app-border/70 pt-3 sm:hidden">
            <router-link
              v-for="link in links"
              :key="`mobile-${link.to}`"
              :to="link.to"
              class="rounded-md px-3 py-2 text-sm font-medium transition"
              :class="
                isActiveRoute(link.to)
                  ? 'bg-app-brand/20 text-indigo-300'
                  : 'text-app-muted hover:bg-app-surfaceSoft hover:text-app-text'
              "
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
            </router-link>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDebounceFn } from "@vueuse/core";
import { useMovies } from "../composables/useMovies";
import CardSizeToggle from "./CardSizeToggle.vue";
import AppInput from "./ui/AppInput.vue";
import AppButton from "./ui/AppButton.vue";

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

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
  }
);
</script>
