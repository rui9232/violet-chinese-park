<script setup>
import Mascot from "./Mascot.vue";

defineProps({
  round: { type: [Number, String], required: true },
  total: { type: [Number, String], required: true },
  unit: { type: String, default: "關" },
  progress: { type: String, default: "" },
  hearts: { type: Number, default: null },
  mood: { type: String, default: "idle" },
  say: { type: String, default: "" },
  hint: { type: String, default: "" },
  label: { type: String, default: "" },
});
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center gap-3">
      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex h-8 items-center rounded-full bg-cream px-3 text-sm font-black text-ink/60">
            {{ label || `第 ${round} / ${total} ${unit}` }}
          </span>
          <span v-if="hearts !== null" class="inline-flex h-8 items-center text-base leading-none">
            {{ "❤️".repeat(Math.max(hearts, 0)) }}{{ "🤍".repeat(Math.max(3 - hearts, 0)) }}
          </span>
        </div>
        <p v-if="progress" class="truncate font-display text-xl leading-tight text-berry">{{ progress }}</p>
      </div>
      <Mascot class="shrink-0" :mood="mood" size="xs" :say="say" />
    </div>
    <p v-if="hint" class="text-center text-sm font-bold leading-snug text-ink/50">{{ hint }}</p>
  </div>
</template>
