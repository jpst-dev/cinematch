<template>
  <div
    class="rounded-lg overflow-hidden bg-zinc-800 shadow-md hover:shadow-xl hover:scale-[1.03] transition-transform duration-300 w-full"
    :class="{
      'max-w-[150px]': size === 'sm',
      'max-w-[200px]': size === 'md',
      'max-w-[300px]': size === 'lg',
    }"
  >
    <div class="aspect-[2/3] w-full">
      <img
        :src="`https://image.tmdb.org/t/p/w300${movie.poster_path}`"
        alt="poster"
        class="object-cover w-full h-full"
      />
    </div>
    <div class="p-3">
      <h2 class="mb-1 text-base font-semibold text-white truncate sm:text-lg">
        {{ movie.title }}
      </h2>
      <p class="text-sm text-zinc-300">Nota: {{ movie.vote_average }}</p>
      <p class="text-sm text-zinc-400">Lançamento: {{ movie.release_date }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ movie: any; size?: "sm" | "md" | "lg" }>();
</script>
