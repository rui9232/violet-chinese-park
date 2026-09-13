<script setup>
defineProps({
  label: { type: String, default: "" },
  color: { type: String, default: "bg-sun" },
  disabled: { type: Boolean, default: false },
});
defineEmits(["click"]);
</script>

<template>
  <button
    type="button"
    class="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-2xl px-5 py-3 text-lg font-black text-white shadow-chunky transition active:translate-y-1 active:shadow-none disabled:opacity-50"
    :class="color"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot>{{ label }}</slot>
  </button>
</template>
