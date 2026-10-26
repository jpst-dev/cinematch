<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
    :class="solida ? 'bg-app-bg/90 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md' : 'bg-gradient-to-b from-black/80 to-transparent'"
  >
    <div class="pagina relative flex h-16 items-center gap-8">
      <router-link to="/" class="font-display text-3xl leading-none tracking-wide text-app-brand" aria-label="CineMatch, início">
        CINEMATCH
      </router-link>

      <nav class="hidden items-center gap-6 lg:flex" aria-label="Principal">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="relative py-1 text-sm transition"
          :class="ativo(link.to) ? 'font-semibold text-white' : 'text-zinc-300 hover:text-white'"
          :aria-current="ativo(link.to) ? 'page' : undefined"
        >
          {{ link.label }}
          <span v-if="ativo(link.to)" class="absolute -bottom-1 left-0 h-0.5 w-full rounded bg-app-brand"></span>
        </router-link>
      </nav>

      <div ref="caixaBusca" class="ml-auto flex items-center gap-2">
        <form
          v-if="buscaAberta"
          role="search"
          class="absolute inset-x-4 top-3 z-10 sm:static sm:inset-auto"
          @submit.prevent="irParaBusca"
        >
          <label class="sr-only" for="busca">Buscar filmes</label>
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
            <input
              id="busca"
              ref="campo"
              v-model="termo"
              type="search"
              autocomplete="off"
              placeholder="Buscar filmes"
              class="h-10 w-full rounded-md border border-white/20 bg-black/80 pl-9 pr-9 text-sm text-white placeholder:text-app-muted focus:border-app-brand sm:w-72"
              @input="sugerir"
              @keydown.esc="fecharBusca"
            />
            <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-app-muted hover:text-white" aria-label="Fechar busca" @click="fecharBusca">
              <X class="h-4 w-4" />
            </button>
          </div>
          <ul
            v-if="sugestoes.length"
            class="absolute right-0 top-full mt-2 w-full overflow-hidden rounded-md border border-app-border bg-app-surface shadow-2xl sm:w-80"
          >
            <li v-for="filme in sugestoes" :key="filme.id">
              <router-link
                :to="`/filme/${filme.id}`"
                class="flex items-center gap-3 px-3 py-2 transition hover:bg-app-surfaceSoft"
                @click="fecharBusca"
              >
                <img
                  v-if="filme.poster_path"
                  :src="IMG('w185', filme.poster_path)!"
                  alt=""
                  class="h-14 w-10 shrink-0 rounded object-cover"
                />
                <span v-else class="h-14 w-10 shrink-0 rounded bg-app-surfaceSoft"></span>
                <span class="min-w-0">
                  <span class="block truncate text-sm text-white">{{ filme.title }}</span>
                  <span class="text-xs text-app-muted">{{ ano(filme.release_date) }}</span>
                </span>
              </router-link>
            </li>
          </ul>
        </form>
        <button
          v-else
          type="button"
          class="grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/10"
          aria-label="Abrir busca"
          @click="abrirBusca"
        >
          <Search class="h-5 w-5" />
        </button>

        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/10 lg:hidden"
          :aria-expanded="menuAberto"
          aria-controls="menu-celular"
          aria-label="Abrir menu"
          @click="menuAberto = true"
        >
          <Menu class="h-6 w-6" />
        </button>
      </div>
    </div>

    <Transition
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
    >
      <div
        v-if="menuAberto"
        id="menu-celular"
        class="fixed inset-0 z-50 flex flex-col bg-app-bg/[0.98] px-6 pb-10 pt-4 lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        @keydown.esc="menuAberto = false"
      >
        <div class="flex h-12 items-center justify-between">
          <span class="font-display text-3xl tracking-wide text-app-brand">CINEMATCH</span>
          <button
            ref="fecharMenu"
            type="button"
            class="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10"
            aria-label="Fechar menu"
            @click="menuAberto = false"
          >
            <X class="h-6 w-6" />
          </button>
        </div>
        <nav class="mt-10 flex flex-col gap-2" aria-label="Principal">
          <router-link
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="font-display text-5xl tracking-wide transition"
            :class="ativo(link.to) ? 'text-app-brand' : 'text-white hover:text-app-brand'"
            :aria-current="ativo(link.to) ? 'page' : undefined"
          >
            {{ link.label }}
          </router-link>
        </nav>
        <p class="mt-auto text-xs text-app-muted">Dados de filmes: TMDb</p>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDebounceFn, useWindowScroll, onClickOutside } from "@vueuse/core";
import { Search, Menu, X } from "lucide-vue-next";
import { useMovies } from "../composables/useMovies";
import { IMG } from "../services/tmdb";
import { ano } from "../utils/format";
import type { Movie } from "../types/movie";

const route = useRoute();
const router = useRouter();
const { searchMovies } = useMovies();

const links = [
  { label: "Início", to: "/" },
  { label: "Em cartaz", to: "/em-cartaz" },
  { label: "Em alta", to: "/em-alta" },
  { label: "Mais bem avaliados", to: "/top-rated" },
  { label: "Explorar", to: "/explorar" },
];

const ativo = (to: string) => route.path === to;

// Transparente só sobre as páginas com imagem de fundo (Início e filme), e só no topo.
const { y } = useWindowScroll();
const paginaComImagem = computed(() => route.name === "Home" || route.name === "MovieDetail");
const solida = computed(() => !paginaComImagem.value || y.value > 40 || buscaAberta.value);

const menuAberto = ref(false);
const fecharMenu = ref<HTMLButtonElement | null>(null);
watch(menuAberto, async (aberto) => {
  document.body.style.overflow = aberto ? "hidden" : "";
  if (aberto) {
    await nextTick();
    fecharMenu.value?.focus();
  }
});

const buscaAberta = ref(false);
const termo = ref("");
const sugestoes = ref<Movie[]>([]);
const campo = ref<HTMLInputElement | null>(null);
const caixaBusca = ref<HTMLElement | null>(null);

const abrirBusca = async () => {
  buscaAberta.value = true;
  await nextTick();
  campo.value?.focus();
};

const fecharBusca = () => {
  buscaAberta.value = false;
  termo.value = "";
  sugestoes.value = [];
};

onClickOutside(caixaBusca, () => {
  if (buscaAberta.value && !termo.value) fecharBusca();
  else sugestoes.value = [];
});

const sugerir = useDebounceFn(async () => {
  const q = termo.value.trim();
  if (!q) {
    sugestoes.value = [];
    return;
  }
  try {
    const resultado = await searchMovies(q);
    if (termo.value.trim() === q) sugestoes.value = resultado.slice(0, 6);
  } catch {
    sugestoes.value = [];
  }
}, 350);

const irParaBusca = () => {
  const q = termo.value.trim();
  if (!q) return;
  router.push({ path: "/buscar", query: { q } });
  fecharBusca();
};

// Tecla "/" abre a busca de qualquer lugar (exceto quando já se está digitando).
const atalho = (e: KeyboardEvent) => {
  const alvo = e.target as HTMLElement;
  if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName)) {
    e.preventDefault();
    abrirBusca();
  }
};
onMounted(() => window.addEventListener("keydown", atalho));
onUnmounted(() => {
  window.removeEventListener("keydown", atalho);
  document.body.style.overflow = "";
});

watch(
  () => route.fullPath,
  () => {
    menuAberto.value = false;
  }
);
</script>
