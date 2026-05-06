<template>
  <div class="app-shell font-sans">
    <Navbar />
    <main class="pb-16">
      <router-view />
    </main>
    <button
      v-show="showBackToTop"
      @click="scrollToTop"
      class="app-button-primary fixed bottom-6 right-6 z-40 px-3 py-2 shadow-lg"
      aria-label="Voltar ao topo"
    >
      Topo
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Navbar from "./components/Navbar.vue";

const showBackToTop = ref(false);

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 400;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
