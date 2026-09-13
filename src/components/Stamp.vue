<script setup>
defineProps({
  text: { type: String, default: "好棒" },
  good: { type: Boolean, default: true },
});
</script>

<template>
  <div class="pointer-events-none absolute right-3 top-8 z-20 rotate-12 bounce-in">
    <div
      class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-dashed text-xl font-black"
      :class="good ? 'border-berry bg-sun/90 text-berry' : 'border-ink/30 bg-white text-ink/60'"
    >
      {{ text }}
    </div>
  </div>
</template>
