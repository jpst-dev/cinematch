<template>
  <div>
    <!-- Carregando -->
    <div v-if="carregando" aria-hidden="true">
      <div class="relative h-[70vh] min-h-[480px] animate-pulse bg-app-surface"></div>
      <div class="pagina -mt-40 flex items-end gap-8">
        <div class="hidden aspect-[2/3] w-60 shrink-0 animate-pulse rounded-lg bg-app-surfaceSoft md:block"></div>
        <div class="w-full max-w-xl space-y-3">
          <div class="h-16 w-3/4 animate-pulse rounded bg-app-surfaceSoft"></div>
          <div class="h-4 w-1/2 animate-pulse rounded bg-app-surfaceSoft"></div>
          <div class="h-20 animate-pulse rounded bg-app-surfaceSoft"></div>
        </div>
      </div>
    </div>

    <!-- Não encontrado -->
    <div v-else-if="!filme" class="pagina pb-16 pt-36 text-center">
      <h1 class="font-display text-5xl tracking-wide text-white">Filme não encontrado</h1>
      <p class="mt-2 text-app-muted">Ele pode ter sido removido ou o link está incorreto.</p>
      <router-link to="/" class="btn-primario mt-6">Voltar ao início</router-link>
    </div>

    <article v-else>
      <section class="relative flex min-h-[70vh] items-end overflow-hidden sm:min-h-[82vh]">
        <img
          v-if="backdrop"
          :src="backdrop"
          alt=""
          class="absolute inset-0 h-full w-full object-cover object-[center_20%]"
          fetchpriority="high"
        />
        <div v-else class="sem-imagem absolute inset-0"></div>
        <div class="sombra-lateral absolute inset-0"></div>
        <div class="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-app-bg via-app-bg/70 to-transparent"></div>

        <div class="pagina relative flex w-full flex-col gap-6 pb-10 pt-28 sm:pb-14 md:flex-row md:items-end md:gap-10">
          <img
            v-if="poster"
            :src="poster"
            :alt="`Pôster de ${filme.title}`"
            class="w-28 shrink-0 rounded-lg shadow-2xl shadow-black/60 ring-1 ring-white/10 md:block md:w-56 lg:w-64"
            :class="{ hidden: backdrop }"
          />
          <div class="max-w-2xl">
            <h1
              class="hyphens-auto break-words font-display uppercase leading-[0.9] tracking-wide text-white"
              :class="filme.title.length > 22 ? 'text-5xl sm:text-6xl lg:text-7xl' : 'text-6xl sm:text-7xl lg:text-8xl'"
            >
              {{ filme.title }}
            </h1>
            <p v-if="filme.original_title && filme.original_title !== filme.title" class="mt-2 text-sm italic text-app-muted">
              {{ filme.original_title }}
            </p>

            <p class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-200">
              <span v-if="nota" class="font-semibold text-app-brand">
                ★ {{ nota }}
                <span v-if="filme.vote_count" class="font-normal text-app-muted">({{ filme.vote_count.toLocaleString("pt-BR") }} votos)</span>
              </span>
              <span v-if="dataLancamento">{{ dataLancamento }}</span>
              <span v-if="duracao">{{ duracao }}</span>
            </p>

            <ul v-if="filme.genres?.length" class="mt-4 flex flex-wrap gap-2" aria-label="Gêneros">
              <li
                v-for="genero in filme.genres"
                :key="genero.id"
                class="rounded-full border border-app-brand/40 px-3 py-1 text-xs font-medium text-app-brand"
              >
                {{ genero.name }}
              </li>
            </ul>

            <p v-if="filme.tagline" class="mt-5 italic text-zinc-300">“{{ filme.tagline }}”</p>
            <p v-if="filme.overview" class="mt-3 leading-relaxed text-zinc-200">{{ filme.overview }}</p>

            <dl v-if="equipe.direcao.length || equipe.roteiro.length" class="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <template v-if="equipe.direcao.length">
                <dt class="text-app-muted">Direção</dt>
                <dd class="text-white">{{ equipe.direcao.join(", ") }}</dd>
              </template>
              <template v-if="equipe.roteiro.length">
                <dt class="text-app-muted">Roteiro</dt>
                <dd class="text-white">{{ equipe.roteiro.slice(0, 3).join(", ") }}</dd>
              </template>
            </dl>

            <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a v-if="trailer" href="#trailer" class="btn-primario" @click.prevent="irParaTrailer">
                <Play class="h-4 w-4 fill-current" /> Ver trailer
              </a>
              <div v-if="provedores.length" class="flex items-center gap-3">
                <span class="text-sm text-app-muted">Onde assistir</span>
                <ul class="flex flex-wrap gap-2">
                  <li v-for="p in provedores" :key="p.provider_id">
                    <a :href="linkProvedores" target="_blank" rel="noopener noreferrer" class="block transition hover:scale-110" :title="p.provider_name">
                      <img :src="IMG('w45', p.logo_path)!" :alt="p.provider_name" class="h-9 w-9 rounded-md ring-1 ring-white/10" loading="lazy" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="trailer" id="trailer" class="pagina mt-6 scroll-mt-20" aria-labelledby="titulo-trailer">
        <h2 id="titulo-trailer" class="mb-3 text-lg font-semibold text-white sm:text-xl">Trailer</h2>
        <div class="aspect-video max-w-5xl overflow-hidden rounded-lg bg-app-surface ring-1 ring-white/10">
          <iframe
            :src="`https://www.youtube-nocookie.com/embed/${trailer}`"
            :title="`Trailer de ${filme.title}`"
            class="h-full w-full"
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </section>

      <section v-if="elenco.length" class="mt-12" aria-labelledby="titulo-elenco">
        <h2 id="titulo-elenco" class="pagina mb-3 text-lg font-semibold text-white sm:text-xl">Elenco principal</h2>
        <ul class="pagina scrollbar-none flex snap-x gap-4 overflow-x-auto scroll-px-4 pb-2 sm:scroll-px-8 lg:scroll-px-12">
          <li v-for="ator in elenco" :key="ator.credit_id" class="w-28 shrink-0 snap-start sm:w-32">
            <img
              v-if="ator.profile_path"
              :src="IMG('w185', ator.profile_path)!"
              :alt="ator.name"
              class="aspect-[2/3] w-full rounded-md object-cover ring-1 ring-white/5"
              loading="lazy"
            />
            <div
              v-else
              class="flex aspect-[2/3] w-full items-center justify-center rounded-md bg-app-surfaceSoft font-display text-4xl text-app-muted"
              aria-hidden="true"
            >
              {{ iniciais(ator.name) }}
            </div>
            <p class="mt-2 line-clamp-1 text-sm font-medium text-white">{{ ator.name }}</p>
            <p v-if="ator.character" class="line-clamp-1 text-xs text-app-muted">{{ ator.character }}</p>
          </li>
        </ul>
      </section>

      <MovieRow class="mt-12" titulo="Você também pode gostar" :filmes="recomendados" />
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTitle } from "@vueuse/core";
import { Play } from "lucide-vue-next";
import MovieRow from "../components/MovieRow.vue";
import { useMovieDetail } from "../composables/useMovieDetail";
import { IMG } from "../services/tmdb";
import { formatData, formatDuracao, formatNota } from "../utils/format";
import { escolherTrailer, equipeChave, iniciais } from "../utils/detalhe";
import type { Movie } from "../types/movie";

const route = useRoute();
const id = String(route.params.id);
const { getMovieDetails, getCredits, getVideos, getRecommendations, getWatchProviders } = useMovieDetail();

const carregando = ref(true);
const filme = ref<any>(null);
const trailer = ref<string | null>(null);
const creditos = ref<{ cast: any[]; crew: any[] }>({ cast: [], crew: [] });
const recomendados = ref<Movie[]>([]);
const onde = ref<any>(null);

const poster = computed(() => IMG("w500", filme.value?.poster_path));
const backdrop = computed(() => IMG("w1280", filme.value?.backdrop_path));
const nota = computed(() => formatNota(filme.value?.vote_average));
const dataLancamento = computed(() => formatData(filme.value?.release_date));
const duracao = computed(() => formatDuracao(filme.value?.runtime));
const equipe = computed(() => equipeChave(creditos.value.crew));
const elenco = computed(() => creditos.value.cast.slice(0, 15));
const provedores = computed<any[]>(() => onde.value?.flatrate ?? []);
const linkProvedores = computed(() => onde.value?.link);

const titulo = useTitle();
const tituloOriginal = titulo.value;

const irParaTrailer = () => {
  document.getElementById("trailer")?.scrollIntoView({ behavior: "smooth" });
  history.replaceState(history.state, "", "#trailer");
};

// Sem trailer em português, tenta o original em inglês.
const buscarTrailer = async () => {
  const pt = escolherTrailer(await getVideos(id));
  return pt ?? escolherTrailer(await getVideos(id, "en-US"));
};

onMounted(async () => {
  try {
    filme.value = await getMovieDetails(id);
    titulo.value = `${filme.value.title} | CineMatch`;
  } catch {
    filme.value = null;
  } finally {
    carregando.value = false;
  }
  if (!filme.value) return;

  // O resto é complementar: se algo falhar, a seção simplesmente não aparece.
  const [t, c, r, w] = await Promise.allSettled([
    buscarTrailer(),
    getCredits(id),
    getRecommendations(id),
    getWatchProviders(id),
  ]);
  if (t.status === "fulfilled") trailer.value = t.value;
  if (c.status === "fulfilled") creditos.value = c.value;
  if (r.status === "fulfilled") recomendados.value = r.value.slice(0, 15);
  if (w.status === "fulfilled") onde.value = w.value ?? null;

  if (route.hash === "#trailer" && trailer.value) {
    await nextTick();
    document.getElementById("trailer")?.scrollIntoView({ behavior: "smooth" });
  }
});

onUnmounted(() => (titulo.value = tituloOriginal));
</script>

<style scoped>
.sombra-lateral {
  background: linear-gradient(90deg, #070707 0%, rgba(7, 7, 7, 0.8) 35%, rgba(7, 7, 7, 0) 70%);
}
.sem-imagem {
  background: radial-gradient(ellipse at 75% 0%, rgba(251, 191, 36, 0.14), transparent 60%), #0b0b0c;
}
</style>
