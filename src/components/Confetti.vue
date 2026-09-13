<script setup>
const bits = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 17) % 100}%`,
  delay: `${(i % 6) * 0.12}s`,
  emoji: ["🎊", "⭐", "🎈", "🌸", "🍋", "💙"][i % 6],
  duration: `${1.6 + (i % 4) * 0.25}s`,
}));
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <span
      v-for="(bit, i) in bits"
      :key="i"
      class="absolute -top-6 text-2xl"
      :style="{
        left: bit.left,
        animation: `fall ${bit.duration} ${bit.delay} ease-in forwards`,
      }"
    >
      {{ bit.emoji }}
    </span>
  </div>
</template>

<style scoped>
@keyframes fall {
  to {
    transform: translateY(420px) rotate(180deg);
    opacity: 0.2;
  }
}
</style>
