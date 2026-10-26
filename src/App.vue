<template>
  <div class="flex min-h-screen flex-col">
    <a href="#conteudo" class="sr-only z-[60] rounded-md bg-app-brand px-4 py-2 font-semibold text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
      Pular para o conteúdo
    </a>
    <Navbar />
    <main id="conteudo" class="flex-1 pb-16">
      <router-view :key="route.path" />
    </main>
    <footer class="pagina border-t border-app-border py-8 text-xs text-app-muted">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span class="font-display text-lg tracking-wide text-app-brand">CINEMATCH</span>
          · feito por
          <a href="https://jteixeira.dev" class="text-app-text underline-offset-4 hover:text-app-brand hover:underline">João Teixeira</a>
        </p>
        <p>Este produto usa a API do TMDb, mas não é endossado ou certificado pelo TMDb.</p>
      </div>
    </footer>
    <Transition enter-from-class="opacity-0 translate-y-2" leave-to-class="opacity-0 translate-y-2" enter-active-class="transition" leave-active-class="transition">
      <button
        v-show="mostrarTopo"
        type="button"
        class="fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-app-brand text-black shadow-lg shadow-black/50 transition hover:bg-app-brandHover"
        aria-label="Voltar ao topo"
        @click="voltarAoTopo"
      >
        <ArrowUp class="h-5 w-5" />
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useWindowScroll } from "@vueuse/core";
import { ArrowUp } from "lucide-vue-next";
import Navbar from "./components/Navbar.vue";

const route = useRoute();
const { y } = useWindowScroll();
const mostrarTopo = computed(() => y.value > 600);

const voltarAoTopo = () => window.scrollTo({ top: 0, behavior: "smooth" });
</script>
