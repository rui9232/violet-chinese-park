<script setup>
defineProps({
  show: { type: Boolean, default: false },
});

const stars = [
  { dx: "-50px", dy: "-70px", emoji: "⭐" },
  { dx: "40px", dy: "-80px", emoji: "✨" },
  { dx: "-70px", dy: "-20px", emoji: "💛" },
  { dx: "70px", dy: "-30px", emoji: "🌟" },
  { dx: "10px", dy: "-90px", emoji: "🎉" },
  { dx: "-20px", dy: "-50px", emoji: "🌸" },
];
</script>

<template>
  <div v-if="show" class="pointer-events-none absolute inset-0 z-10 overflow-hidden">
    <span
      v-for="(star, i) in stars"
      :key="i"
      class="absolute left-1/2 top-1/3 text-2xl star-burst"
      :style="{ '--dx': star.dx, '--dy': star.dy, animationDelay: `${i * 40}ms` }"
    >
      {{ star.emoji }}
    </span>
  </div>
</template>
