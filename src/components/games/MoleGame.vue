<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import GameHud from "../GameHud.vue";
import Sparkles from "../Sparkles.vue";
import { addStars, cuteOops, cuteYeah, sfxCorrect, sfxPop, sfxWrong, trackTimers } from "../../lib/fun";

const props = defineProps({
  items: { type: Array, required: true },
});
const emit = defineEmits(["done"]);

const index = ref(0);
const score = ref(0);
const hearts = ref(3);
const hits = ref(0);
const holes = ref(Array(6).fill(null));
const mood = ref("wow");
const say = ref("看準了再打！");
const sparkle = ref(false);
const playing = ref(true);
const NEED = 3;
const timers = trackTimers();

const current = computed(() => props.items[index.value]);

onMounted(startRound);
onUnmounted(stop);

function startRound() {
  if (!current.value) return;
  hits.value = 0;
  holes.value = Array(6).fill(null);
  sparkle.value = false;
  mood.value = "wow";
  say.value = current.value.prompt || `打出「${current.value.target}」！`;
  timers.clear();
  tick();
  timers.every(tick, 2500);
}

function stop() {
  timers.clear();
}

function tick() {
  if (!playing.value || !current.value) return;
  const next = Array(6).fill(null);
  const decoys = (current.value.decoys || []).filter((item) => item && item !== current.value.target);
  const targetHole = Math.floor(Math.random() * 6);
  next[targetHole] = { text: current.value.target, target: true };
  if (decoys.length && Math.random() < 0.4) {
    let hole = Math.floor(Math.random() * 6);
    while (hole === targetHole) hole = Math.floor(Math.random() * 6);
    const text = decoys[Math.floor(Math.random() * decoys.length)];
    next[hole] = { text, target: false };
  }
  holes.value = next;
}

function hit(i) {
  const mole = holes.value[i];
  if (!playing.value || !mole) return;
  const next = [...holes.value];
  next[i] = null;
  holes.value = next;
  sfxPop();
  if (mole.target) {
    hits.value += 1;
    sparkle.value = true;
    mood.value = "happy";
    say.value = cuteYeah();
    sfxCorrect();
    addStars(1);
    if (hits.value >= NEED) {
      score.value += 1;
      nextRound();
    }
  } else {
    hearts.value -= 1;
    sparkle.value = false;
    mood.value = "sad";
    say.value = cuteOops();
    sfxWrong();
    if (hearts.value <= 0) finish();
  }
}

function nextRound() {
  timers.clear();
  holes.value = Array(6).fill(null);
  if (index.value + 1 >= props.items.length) {
    finish();
    return;
  }
  index.value += 1;
  timers.later(startRound, 550);
}

function finish() {
  if (!playing.value) return;
  playing.value = false;
  stop();
  emit("done", { score: score.value, total: props.items.length });
}
</script>

<template>
  <div class="relative space-y-3">
    <Sparkles :show="sparkle" />
    <GameHud
      :round="index + 1"
      :total="items.length"
      unit="洞"
      :progress="`打中 ${hits} / ${NEED} 次「${current?.target}」`"
      :hearts="hearts"
      :mood="mood"
      :say="say"
    />
    <p class="rounded-2xl bg-sun/70 px-4 py-2 text-center font-black">
      {{ current?.prompt || `打出「${current?.target}」` }}
    </p>
    <div class="grid grid-cols-3 gap-3">
      <button
        v-for="(mole, i) in holes"
        :key="i"
        type="button"
        class="hole relative flex h-28 items-end justify-center overflow-hidden rounded-[1.75rem]"
        @click="hit(i)"
      >
        <span class="pointer-events-none absolute top-1 text-lg">🌿</span>
        <div
          v-if="mole"
          class="mole-up mb-2 flex w-[86%] flex-col items-center rounded-t-[1.4rem] bg-sun px-1 py-2 shadow-chunky"
        >
          <span class="text-xl leading-none">🐹</span>
          <span class="text-center text-sm font-black leading-tight">{{ mole.text }}</span>
        </div>
      </button>
    </div>
  </div>
</template>
