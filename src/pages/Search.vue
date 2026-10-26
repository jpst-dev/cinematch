<template>
  <div>
    <PageHeader titulo="Busca" :subtitulo="termoBuscado ? `Resultados para “${termoBuscado}”` : undefined">
      <label class="relative block max-w-xl">
        <span class="sr-only">Buscar filmes</span>
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
        <input v-model="termo" type="search" placeholder="Buscar filmes" class="app-input pl-9" autofocus />
      </label>
    </PageHeader>
    <template v-if="termoBuscado">
      <PosterGrid :filmes="filmes" :carregando="carregando" :fim="fim || erro" @mais="carregarMais" />
      <EstadoLista :erro="erro" :vazio="!carregando && !erro && !filmes.length" @tentar="carregarMais">
        Nenhum filme encontrado para “{{ termoBuscado }}”.
      </EstadoLista>
    </template>
    <p v-else class="pagina py-16 text-center text-app-muted">Digite o nome de um filme.</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { watchDebounced } from "@vueuse/core";
import { Search } from "lucide-vue-next";
import PageHeader from "../components/PageHeader.vue";
import PosterGrid from "../components/PosterGrid.vue";
import EstadoLista from "../components/EstadoLista.vue";
import { useMovies } from "../composables/useMovies";
import { useListaPaginada } from "../composables/useListaPaginada";

const route = useRoute();
const router = useRouter();
const { searchMovies } = useMovies();

const inicial = typeof route.query.q === "string" ? route.query.q : "";
const termo = ref(inicial);
const termoBuscado = ref(inicial.trim());

const { filmes, carregando, erro, fim, carregarMais, recarregar } = useListaPaginada((pagina) =>
  searchMovies(termoBuscado.value, pagina)
);

// O termo fica na URL para a busca poder ser compartilhada ou recarregada.
watchDebounced(
  termo,
  (valor) => {
    termoBuscado.value = valor.trim();
    router.replace({ query: termoBuscado.value ? { q: termoBuscado.value } : {} });
    if (termoBuscado.value) recarregar();
  },
  { debounce: 450 }
);

// A navbar pode mandar uma busca nova enquanto esta página já está aberta.
watch(
  () => route.query.q,
  (q) => {
    const novo = typeof q === "string" ? q.trim() : "";
    if (novo && novo !== termoBuscado.value) termo.value = novo;
  }
);

onMounted(() => {
  if (termoBuscado.value) carregarMais();
});
</script>
