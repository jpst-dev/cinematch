<template>
  <button
    :type="type"
    :class="[variant === 'primary' ? 'app-button-primary' : 'app-button-ghost', buttonClass]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "ghost";
  buttonClass?: string;
}

withDefaults(defineProps<Props>(), {
  type: "button",
  variant: "primary",
  buttonClass: "",
});
</script>
