<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import GameHud from "../GameHud.vue";
import Sparkles from "../Sparkles.vue";
import { addStars, cuteOops, cuteYeah, pickSpawn, sfxCorrect, sfxWhoosh, sfxWrong, trackTimers } from "../../lib/fun";

const props = defineProps({
  items: { type: Array, required: true },
});
const emit = defineEmits(["done"]);

const field = ref(null);
const index = ref(0);
const score = ref(0);
const hearts = ref(3);
const grabbed = ref(0);
const lane = ref(1);
const words = ref([]);
const mood = ref("wow");
const say = ref("換跑道衝呀！");
const sparkle = ref(false);
const shake = ref(false);
const playing = ref(true);
const NEED = 3;
const LANES = [18, 50, 82];
const timers = trackTimers();

let raf = 0;
let last = 0;
let idSeq = 0;
let swipeX = 0;
let ticking = false;

const current = computed(() => props.items[index.value]);
const speed = computed(() => 0.7 + index.value * 0.06);

onMounted(() => {
  startRound();
  window.addEventListener("keydown", onKey);
});
onUnmounted(() => {
  stop();
  window.removeEventListener("keydown", onKey);
});

function startRound() {
  if (!current.value) return;
  grabbed.value = 0;
  words.value = [];
  sparkle.value = false;
  mood.value = "wow";
  say.value = current.value.prompt || `衝去接「${current.value.target}」！`;
  last = 0;
  ticking = true;
  timers.clear();
  spawn();
  timers.every(spawn, 2600);
  raf = window.requestAnimationFrame(loop);
}

function stop() {
  ticking = false;
  timers.clear();
  if (raf) window.cancelAnimationFrame(raf);
  raf = 0;
}

function spawn() {
  if (!ticking || !playing.value || !current.value || words.value.length >= 2) return;
  const needTarget = !words.value.some((item) => item.target);
  const picked = pickSpawn(current.value.target, current.value.decoys, 0.5, needTarget);
  words.value = [
    ...words.value,
    {
      id: ++idSeq,
      text: picked.text,
      target: picked.isTarget,
      lane: Math.floor(Math.random() * 3),
      y: -40,
    },
  ];
}

function loop(time) {
  if (!ticking || !playing.value) return;
  const dt = last ? Math.min(2.2, (time - last) / 16.67) : 1;
  last = time;
  const next = [];
  for (const item of words.value) {
    const y = item.y + speed.value * dt;
    if (y >= 248 && y <= 300 && item.lane === lane.value) {
      const ended = collect(item);
      if (ended) return;
      continue;
    }
    if (y > 340) continue;
    next.push({ ...item, y });
  }
  if (!ticking || !playing.value) return;
  words.value = next;
  raf = window.requestAnimationFrame(loop);
}

function collect(item) {
  if (item.target) {
    grabbed.value += 1;
    sparkle.value = true;
    mood.value = "happy";
    say.value = cuteYeah();
    sfxCorrect();
    addStars(1);
    if (grabbed.value >= NEED) {
      score.value += 1;
      nextRound();
      return true;
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
    if (hearts.value <= 0) {
      finish();
      return true;
    }
  }
  return false;
}

function setLane(next) {
  const clamped = Math.min(2, Math.max(0, next));
  if (clamped === lane.value) return;
  lane.value = clamped;
  sfxWhoosh();
}

function onKey(event) {
  if (!playing.value) return;
  if (event.key === "ArrowLeft") setLane(lane.value - 1);
  if (event.key === "ArrowRight") setLane(lane.value + 1);
}

function onDown(event) {
  swipeX = event.clientX;
}

function onUp(event) {
  const dx = event.clientX - swipeX;
  if (dx > 28) setLane(lane.value + 1);
  else if (dx < -28) setLane(lane.value - 1);
  else tapLane(event);
}

function tapLane(event) {
  if (!field.value) return;
  const rect = field.value.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  setLane(ratio < 0.33 ? 0 : ratio > 0.66 ? 2 : 1);
}

function nextRound() {
  ticking = false;
  if (raf) window.cancelAnimationFrame(raf);
  raf = 0;
  timers.clear();
  words.value = [];
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
      unit="圈"
      :progress="`接到 ${grabbed} / ${NEED} 個「${current?.target}」`"
      :hearts="hearts"
      :mood="mood"
      :say="say"
      hint="左右滑動或點跑道，去接對的字！"
    />
    <div
      ref="field"
      class="dash-road relative h-80 touch-none overflow-hidden rounded-[1.75rem]"
      @pointerdown.prevent="onDown"
      @pointerup.prevent="onUp"
    >
      <div class="pointer-events-none absolute inset-y-0 left-[33%] w-1 bg-white/50" />
      <div class="pointer-events-none absolute inset-y-0 left-[66%] w-1 bg-white/50" />
      <p class="prompt-bar">{{ current?.prompt || `接住「${current?.target}」` }}</p>
      <div
        v-for="item in words"
        :key="item.id"
        class="pointer-events-none absolute z-10 -translate-x-1/2 rounded-2xl bg-white px-2 py-2 text-center shadow-chunky"
        :style="{ left: LANES[item.lane] + '%', top: item.y + 'px' }"
      >
        <p class="text-lg leading-none">{{ item.target ? "⭐" : "🪨" }}</p>
        <p class="max-w-[5.5rem] text-sm font-black leading-tight">{{ item.text }}</p>
      </div>
      <div
        class="pointer-events-none absolute bottom-3 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-grape text-3xl shadow-chunky"
        :style="{ left: LANES[lane] + '%' }"
      >
        🏃
      </div>
    </div>
  </div>
</template>
