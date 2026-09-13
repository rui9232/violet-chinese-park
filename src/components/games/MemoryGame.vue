<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { addStars, sfxCorrect, sfxFlip, sfxWrong, shuffle } from "../../lib/fun";

const props = defineProps({
  pairs: { type: Array, required: true },
});
const emit = defineEmits(["done"]);

const cards = ref([]);
const open = ref([]);
const matched = ref([]);
const moves = ref(0);
const lock = ref(false);
const lastMatch = ref(false);
let doneTimer = 0;
let flipTimer = 0;

onMounted(() => {
  const raw = (props.pairs || []).flatMap((pair, i) => [
    { id: `${i}-a`, pair: i, text: pair.left },
    { id: `${i}-b`, pair: i, text: pair.right },
  ]);
  cards.value = shuffle(raw);
});

onUnmounted(() => {
  if (doneTimer) window.clearTimeout(doneTimer);
  if (flipTimer) window.clearTimeout(flipTimer);
});

const allMatched = computed(() => matched.value.length === props.pairs.length);

function flip(card) {
  if (lock.value || matched.value.includes(card.pair) || open.value.find((item) => item.id === card.id)) return;
  sfxFlip();
  const next = [...open.value, card];
  open.value = next;
  lastMatch.value = false;
  if (next.length === 2) {
    moves.value += 1;
    lock.value = true;
    if (next[0].pair === next[1].pair) {
      matched.value = [...matched.value, card.pair];
      lastMatch.value = true;
      open.value = [];
      lock.value = false;
      sfxCorrect();
      addStars(1);
      if (matched.value.length === props.pairs.length) {
        const score = Math.max(props.pairs.length - Math.floor(Math.max(moves.value - props.pairs.length, 0) / 2), 1);
        doneTimer = window.setTimeout(() => emit("done", { score, total: props.pairs.length }), 650);
      }
    } else {
      sfxWrong();
      if (flipTimer) window.clearTimeout(flipTimer);
      flipTimer = window.setTimeout(() => {
        open.value = [];
        lock.value = false;
      }, 850);
    }
  }
}

function shown(card) {
  return matched.value.includes(card.pair) || open.value.some((item) => item.id === card.id);
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="inline-flex h-8 items-center rounded-full bg-cream px-3 text-sm font-black text-ink/60">
        翻了 {{ moves }} 次 · 配成 {{ matched.length }} / {{ pairs.length }} 對
      </span>
      <p v-if="lastMatch" class="font-display text-lg text-grass">找到好朋友啦！✨</p>
    </div>
    <div class="grid grid-cols-3 gap-3 sm:grid-cols-4" style="perspective: 900px">
      <button
        v-for="card in cards"
        :key="card.id"
        class="relative h-24 [transform-style:preserve-3d]"
        @click="flip(card)"
      >
        <div
          class="card-3d absolute inset-0"
          :class="{ 'is-flipped': shown(card), pop: matched.includes(card.pair) }"
        >
          <div
            class="card-face absolute inset-0 flex items-center justify-center rounded-2xl bg-sky text-3xl font-black text-white shadow-chunky"
          >
            ❓
          </div>
          <div
            class="card-face card-back absolute inset-0 flex items-center justify-center rounded-2xl p-2 text-center text-sm font-black leading-tight shadow-chunky"
            :class="matched.includes(card.pair) ? 'bg-grass text-white' : 'bg-sun text-ink'"
          >
            {{ card.text }}
          </div>
        </div>
      </button>
    </div>
    <p v-if="allMatched" class="text-center text-xl font-black text-grass bounce-in">全部找到了！</p>
  </div>
</template>
