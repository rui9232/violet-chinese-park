<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import GameHud from "../GameHud.vue";
import Sparkles from "../Sparkles.vue";
import { addStars, cuteOops, cuteYeah, pickSpawn, sfxPop, sfxWrong, trackTimers } from "../../lib/fun";

const COLORS = ["#ff6b6b", "#ffb703", "#4cc9f0", "#8ac926", "#c77dff", "#ff8fab"];

const props = defineProps({
  items: { type: Array, required: true },
});
const emit = defineEmits(["done"]);

const index = ref(0);
const score = ref(0);
const hearts = ref(3);
const popped = ref(0);
const balloons = ref([]);
const mood = ref("wow");
const say = ref("戳對的氣球！");
const sparkle = ref(false);
const shake = ref(false);
const playing = ref(true);
const NEED = 3;
const timers = trackTimers();

let raf = 0;
let last = 0;
let idSeq = 0;
let clock = 0;
let ticking = false;

const current = computed(() => props.items[index.value]);

onMounted(startRound);
onUnmounted(stop);

function startRound() {
  if (!current.value) return;
  popped.value = 0;
  balloons.value = [];
  sparkle.value = false;
  mood.value = "wow";
  say.value = current.value.prompt || `戳破「${current.value.target}」氣球！`;
  last = 0;
  clock = 0;
  ticking = true;
  timers.clear();
  spawn();
  timers.every(spawn, 2200);
  raf = window.requestAnimationFrame(loop);
}

function stop() {
  ticking = false;
  timers.clear();
  if (raf) window.cancelAnimationFrame(raf);
  raf = 0;
}

function spawn() {
  if (!ticking || !playing.value || !current.value || balloons.value.length >= 4) return;
  const needTarget = !balloons.value.some((item) => item.target);
  const picked = pickSpawn(current.value.target, current.value.decoys, 0.5, needTarget);
  balloons.value = [
    ...balloons.value,
    {
      id: ++idSeq,
      text: picked.text,
      target: picked.isTarget,
      base: 12 + Math.random() * 76,
      x: 50,
      y: 300 + Math.random() * 40,
      vy: -(0.36 + Math.random() * 0.16),
      phase: Math.random() * 6,
      amp: 5 + Math.random() * 6,
      color: COLORS[idSeq % COLORS.length],
    },
  ];
}

function loop(time) {
  if (!ticking || !playing.value) return;
  const dt = last ? Math.min(2.2, (time - last) / 16.67) : 1;
  last = time;
  clock += dt;
  balloons.value = balloons.value
    .map((item) => ({
      ...item,
      y: item.y + item.vy * dt,
      x: item.base + Math.sin(clock / 9 + item.phase) * item.amp,
    }))
    .filter((item) => item.y > -70);
  if (!ticking || !playing.value) return;
  raf = window.requestAnimationFrame(loop);
}

function pop(item) {
  if (!playing.value || !ticking) return;
  balloons.value = balloons.value.filter((balloon) => balloon.id !== item.id);
  sfxPop();
  if (item.target) {
    popped.value += 1;
    sparkle.value = true;
    mood.value = "happy";
    say.value = cuteYeah();
    addStars(1);
    if (popped.value >= NEED) {
      score.value += 1;
      nextRound();
    }
  } else {
    hearts.value -= 1;
    sparkle.value = false;
    mood.value = "sad";
    say.value = cuteOops();
    shake.value = true;
    sfxWrong();
    timers.later(() => {
      shake.value = false;
    }, 400);
    if (hearts.value <= 0) finish();
  }
}

function nextRound() {
  ticking = false;
  if (raf) window.cancelAnimationFrame(raf);
  raf = 0;
  timers.clear();
  balloons.value = [];
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
  <div class="relative space-y-3" :class="{ shake }">
    <Sparkles :show="sparkle" />
    <GameHud
      :round="index + 1"
      :total="items.length"
      unit="片天空"
      :progress="`戳中 ${popped} / ${NEED} 個「${current?.target}」`"
      :hearts="hearts"
      :mood="mood"
      :say="say"
    />
    <div class="relative h-80 overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-sky to-cream">
      <p class="prompt-bar">{{ current?.prompt || `戳破「${current?.target}」` }}</p>
      <p class="pointer-events-none absolute right-4 top-12 text-3xl float-slow">☁️</p>
      <p class="pointer-events-none absolute left-8 top-20 text-2xl float-delay">☁️</p>
      <button
        v-for="item in balloons"
        :key="item.id"
        type="button"
        class="absolute z-10 -translate-x-1/2 text-center"
        :style="{ left: item.x + '%', top: item.y + 'px' }"
        @click="pop(item)"
      >
        <span
          class="inline-flex min-h-[4.8rem] min-w-[5.2rem] max-w-[7rem] items-center justify-center rounded-full border-4 border-white px-2 text-xs font-black leading-tight text-white shadow-chunky"
          :style="{ background: item.color }"
        >
          {{ item.text }}
        </span>
        <span class="mx-auto mt-[-4px] block h-6 w-0.5 bg-ink/40" />
      </button>
    </div>
  </div>
</template>
