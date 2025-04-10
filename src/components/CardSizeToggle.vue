<template>
  <div class="flex gap-2 items-center">
    <button
      v-for="size in sizes"
      :key="size.value"
      @click="store.setCardSize(size.value)"
      :class="[
        'p-2 rounded border flex items-center gap-1 text-sm transition',
        store.cardSize === size.value
          ? 'bg-indigo-600 text-white border-indigo-500'
          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-white',
      ]"
    >
      <component :is="size.icon" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useMovieStore } from "../store/movieStore";
import { LayoutGrid, Grid2X2, Grid3X3 } from "lucide-vue-next";

const store = useMovieStore();

const sizes: { value: "sm" | "md" | "lg"; icon: any }[] = [
  { value: "sm", icon: Grid3X3 },
  { value: "md", icon: Grid2X2 },
  { value: "lg", icon: LayoutGrid },
];
</script>
