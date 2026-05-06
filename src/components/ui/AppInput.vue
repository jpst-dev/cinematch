<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :class="['app-input', inputClass]"
    @input="onInput"
    @keydown.enter="$emit('enter')"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  type?: string;
  placeholder?: string;
  inputClass?: string;
}

withDefaults(defineProps<Props>(), {
  type: "text",
  placeholder: "",
  inputClass: "",
});

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "enter"): void;
  (event: "input"): void;
}>();

const onInput = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
  emit("input");
};
</script>
