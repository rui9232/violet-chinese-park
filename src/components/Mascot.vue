<script setup>
defineProps({
  mood: { type: String, default: "idle" },
  size: { type: String, default: "lg" },
  say: { type: String, default: "" },
});

const px = { xs: 72, sm: 88, lg: 128, xl: 168 };
</script>

<template>
  <div class="inline-flex flex-col items-center">
    <p
      v-if="say"
      class="mb-1 flex min-h-[2.4rem] max-w-[8.5rem] items-center justify-center rounded-2xl bg-white px-2 py-1 text-center text-xs font-black leading-tight shadow-chunky"
    >
      {{ say }}
    </p>
    <svg
      :width="px[size] || 128"
      :height="px[size] || 128"
      viewBox="0 0 160 160"
      class="drop-shadow-lg"
      :class="mood === 'happy' || mood === 'wow' ? 'mascot-jump' : mood === 'sad' ? 'shake' : 'mascot-idle'"
    >
      <ellipse cx="80" cy="148" rx="38" ry="8" fill="#24305e" opacity="0.12" />
      <circle cx="80" cy="88" r="52" fill="#5b4bff" />
      <circle cx="80" cy="92" r="46" fill="#7c6cff" />
      <ellipse cx="80" cy="54" rx="28" ry="16" fill="#9d91ff" />
      <circle cx="48" cy="48" r="16" fill="#5b4bff" />
      <circle cx="112" cy="48" r="16" fill="#5b4bff" />
      <circle cx="48" cy="48" r="9" fill="#ff8fab" />
      <circle cx="112" cy="48" r="9" fill="#ff8fab" />
      <ellipse cx="58" cy="90" rx="10" ry="12" fill="#fff" />
      <ellipse cx="102" cy="90" rx="10" ry="12" fill="#fff" />
      <circle cx="61" cy="92" r="5" fill="#24305e" />
      <circle cx="105" cy="92" r="5" fill="#24305e" />
      <circle cx="63" cy="90" r="2" fill="#fff" />
      <circle cx="107" cy="90" r="2" fill="#fff" />
      <ellipse cx="58" cy="102" rx="8" ry="5" fill="#ffb3c7" opacity="0.9" />
      <ellipse cx="102" cy="102" rx="8" ry="5" fill="#ffb3c7" opacity="0.9" />
      <path
        v-if="mood === 'sad'"
        d="M68 118 Q80 110 92 118"
        fill="none"
        stroke="#24305e"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        v-else-if="mood === 'wow'"
        d="M80 112 a8 10 0 1 0 0.1 0"
        fill="#24305e"
      />
      <path
        v-else
        d="M66 114 Q80 128 94 114"
        fill="none"
        stroke="#24305e"
        stroke-width="4"
        stroke-linecap="round"
      />
      <text x="80" y="36" text-anchor="middle" font-size="18">{{ mood === "happy" ? "✿" : "✦" }}</text>
    </svg>
  </div>
</template>
