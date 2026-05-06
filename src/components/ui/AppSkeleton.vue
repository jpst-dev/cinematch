<template>
  <div
    class="animate-pulse rounded-lg bg-app-surfaceSoft/70"
    :class="skeletonClass"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
interface Props {
  skeletonClass?: string;
}

withDefaults(defineProps<Props>(), {
  skeletonClass: "h-24 w-full",
});
</script>
