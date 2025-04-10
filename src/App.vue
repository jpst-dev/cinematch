<template>
  <div class="min-h-screen font-sans text-white bg-zinc-900">
    <Navbar />
    <router-view />
    <button
      v-show="showBackToTop"
      @click="scrollToTop"
      class="fixed px-4 py-2 text-white transition-opacity bg-indigo-600 rounded-full shadow-lg bottom-6 right-6 hover:bg-indigo-700"
    >
      ↑ Topo
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
