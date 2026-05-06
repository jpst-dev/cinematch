<template>
  <div class="flex items-center gap-2">
    <button
      v-for="size in sizes"
      :key="size.value"
      @click="store.setCardSize(size.value)"
      :class="[
        'flex items-center gap-1 rounded-md border px-2 py-2 text-sm transition',
        store.cardSize === size.value
          ? 'border-app-brand bg-app-brand text-white'
          : 'border-app-border bg-app-surface text-app-muted hover:bg-app-surfaceSoft hover:text-app-text',
      ]"
      :aria-label="`Alterar grade para ${size.label}`"
      type="button"
    >
      <component :is="size.icon" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useMovieStore } from "../store/movieStore";
import { LayoutGrid, Grid2X2, Grid3X3 } from "lucide-vue-next";

const store = useMovieStore();

const sizes: { value: "sm" | "md" | "lg"; icon: any; label: string }[] = [
  { value: "sm", icon: Grid3X3, label: "compacta" },
  { value: "md", icon: Grid2X2, label: "padrão" },
  { value: "lg", icon: LayoutGrid, label: "grande" },
];
</script>
