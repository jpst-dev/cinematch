<template>
  <div v-if="erro || vazio" class="pagina py-16 text-center" role="status">
    <template v-if="erro">
      <p class="text-app-muted">Não foi possível carregar os filmes.</p>
      <button type="button" class="btn-primario mt-4" @click="$emit('tentar')">
        <RotateCw class="h-4 w-4" /> Tentar de novo
      </button>
    </template>
    <p v-else class="text-app-muted"><slot>Nenhum filme encontrado.</slot></p>
  </div>
</template>

<script setup lang="ts">
import { RotateCw } from "lucide-vue-next";

defineProps<{ erro?: boolean; vazio?: boolean }>();
defineEmits<{ (e: "tentar"): void }>();
</script>
