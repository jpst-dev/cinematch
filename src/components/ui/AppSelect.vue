<template>
  <select
    :value="modelValue"
    :class="['app-select', selectClass]"
    @change="onChange"
  >
    <slot>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </slot>
  </select>
</template>

<script setup lang="ts">
type SelectOption = {
  value: string | number;
  label: string;
};

interface Props {
  modelValue: string | number;
  options?: SelectOption[];
  selectClass?: string;
}

withDefaults(defineProps<Props>(), {
  options: () => [],
  selectClass: "",
});

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const onChange = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLSelectElement).value);
};
</script>
