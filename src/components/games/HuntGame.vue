<script setup>
import { computed, onUnmounted, ref, watch } from "vue";
import KidButton from "../KidButton.vue";
import GameHud from "../GameHud.vue";
import Sparkles from "../Sparkles.vue";
import { addStars, cuteOops, cuteYeah, sfxCorrect, sfxTap, sfxWrong, shuffle } from "../../lib/fun";

const props = defineProps({
  items: { type: Array, required: true },
});
const emit = defineEmits(["done"]);

const index = ref(0);
const score = ref(0);
const found = ref([]);
const wrong = ref("");
const tiles = ref([]);
const mood = ref("wow");
const say = ref("找出同一家人！");
const sparkle = ref(false);
const locked = ref(false);
let wrongTimer = 0;

const current = computed(() => props.items[index.value]);
const answers = computed(() => current.value?.answers || []);
const finished = computed(() => index.value >= props.items.length);

watch(
  index,
  () => {
    if (!current.value) return;
    found.value = [];
    wrong.value = "";
    sparkle.value = false;
    locked.value = false;
    mood.value = "wow";
    say.value = current.value.hint || `找出「${current.value.radical}」部的字`;
    tiles.value = shuffle([...(current.value.picks || [])]);
  },
  { immediate: true }
);

onUnmounted(() => {
  if (wrongTimer) window.clearTimeout(wrongTimer);
});

function tap(char) {
  if (locked.value || found.value.includes(char)) return;
  sfxTap();
  if (answers.value.includes(char)) {
    found.value = [...found.value, char];
    mood.value = "happy";
    say.value = cuteYeah();
    sparkle.value = true;
    sfxCorrect();
    addStars(1);
    if (found.value.length >= answers.value.length) {
      locked.value = true;
      score.value += 1;
    }
  } else {
    wrong.value = char;
    mood.value = "sad";
    say.value = cuteOops();
    sfxWrong();
    if (wrongTimer) window.clearTimeout(wrongTimer);
    wrongTimer = window.setTimeout(() => {
      if (wrong.value === char) wrong.value = "";
    }, 450);
  }
}

function tone(char) {
  if (found.value.includes(char)) return "bg-grass text-white pop";
  if (wrong.value === char) return "bg-berry text-white shake";
  return "bg-white hover:-translate-y-0.5";
}

function next() {
  index.value += 1;
  if (index.value >= props.items.length) {
    emit("done", { score: score.value, total: props.items.length });
  }
}
</script>

<template>
  <div v-if="!finished && current" class="relative space-y-4">
    <Sparkles :show="sparkle" />
    <GameHud
      :round="index + 1"
      :total="items.length"
      unit="族"
      :progress="`找到 ${found.length} / ${answers.length} 個「${current.radical}」部`"
      :mood="mood"
      :say="say"
      :hint="current.hint || `點出有「${current.radical}」的字`"
    />
    <div class="flex items-center justify-center gap-3 rounded-[1.6rem] bg-cream px-4 py-3">
      <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white font-display text-4xl shadow-chunky">
        {{ current.mark || current.radical }}
      </span>
      <div>
        <p class="font-display text-2xl leading-tight">{{ current.radical }}部</p>
        <p class="font-bold text-ink/60">同一家人都有它</p>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <button
        v-for="(char, ti) in tiles"
        :key="`${index}-${ti}-${char}`"
        type="button"
        class="flex min-h-[4.5rem] items-center justify-center rounded-[1.4rem] text-3xl font-black shadow-chunky transition"
        :class="tone(char)"
        @click="tap(char)"
      >
        {{ char }}
      </button>
    </div>
    <KidButton v-if="locked" class="w-full bounce-in" color="bg-ink" @click="next">下一族 GO！</KidButton>
  </div>
</template>
