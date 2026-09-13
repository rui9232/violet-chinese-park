<script setup>
import { computed, onUnmounted, ref, watch } from "vue";
import KidButton from "../KidButton.vue";
import GameHud from "../GameHud.vue";
import Sparkles from "../Sparkles.vue";
import Stamp from "../Stamp.vue";
import { addStars, cuteOops, cuteYeah, sfxCorrect, sfxTap, sfxWrong, shuffle } from "../../lib/fun";

const props = defineProps({
  items: { type: Array, required: true },
});
const emit = defineEmits(["done"]);

const index = ref(0);
const score = ref(0);
const built = ref([]);
const tiles = ref([]);
const shaking = ref(null);
const mood = ref("idle");
const say = ref("幫小火車排隊～");
const sparkle = ref(false);
const stamp = ref("");
const locked = ref(false);
let shakeTimer = 0;

const current = computed(() => props.items[index.value]);
const chars = computed(() => Array.from(current.value?.word || ""));
const expected = computed(() => chars.value[built.value.length] || "");
const finished = computed(() => index.value >= props.items.length);

watch(
  index,
  () => {
    if (!current.value) return;
    built.value = [];
    sparkle.value = false;
    stamp.value = "";
    locked.value = false;
    mood.value = "idle";
    say.value = current.value.hint || "排出正確順序";
    tiles.value = shuffle(
      chars.value.map((c, i) => ({ id: `${index.value}-${i}-${c}`, c, used: false }))
    );
  },
  { immediate: true }
);

onUnmounted(() => {
  if (shakeTimer) window.clearTimeout(shakeTimer);
});

function tap(tile) {
  if (locked.value || tile.used || finished.value) return;
  sfxTap();
  if (tile.c === expected.value) {
    tile.used = true;
    built.value = [...built.value, tile.c];
    mood.value = "happy";
    say.value = cuteYeah();
    sfxCorrect();
    if (built.value.length === chars.value.length) {
      locked.value = true;
      sparkle.value = true;
      stamp.value = "出發";
      score.value += 1;
      addStars(2);
    }
  } else {
    shaking.value = tile.id;
    mood.value = "sad";
    say.value = cuteOops();
    stamp.value = "再排";
    sfxWrong();
    if (shakeTimer) window.clearTimeout(shakeTimer);
    shakeTimer = window.setTimeout(() => {
      shaking.value = null;
      stamp.value = "";
    }, 420);
  }
}

function next() {
  index.value += 1;
  if (index.value >= props.items.length) {
    emit("done", { score: score.value, total: props.items.length });
  }
}
</script>

<template>
  <div v-if="!finished && current" class="relative space-y-5">
    <Sparkles :show="sparkle" />
    <Stamp v-if="stamp" :text="stamp" :good="built.length === chars.length" />
    <GameHud
      :round="index + 1"
      :total="items.length"
      unit="班車"
      :progress="current.hint"
      :mood="mood"
      :say="say"
    />
    <div class="flex flex-wrap items-center justify-center gap-2 rounded-[1.6rem] bg-sky/20 p-4">
      <span class="text-4xl">🚂</span>
      <div
        v-for="(slot, i) in chars"
        :key="i"
        class="train-car flex items-center justify-center rounded-xl border-4 border-dashed border-ink/20 bg-white text-2xl font-black shadow-chunky"
      >
        <span v-if="built[i]" class="pop">{{ built[i] }}</span>
        <span v-else class="text-ink/20">{{ i + 1 }}</span>
      </div>
      <span class="text-3xl">🚃</span>
    </div>
    <div class="flex flex-wrap justify-center gap-3">
      <button
        v-for="tile in tiles"
        :key="tile.id"
        type="button"
        class="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black shadow-chunky transition"
        :class="[
          tile.used ? 'bg-grass text-white opacity-50' : 'bg-sun hover:scale-110',
          shaking === tile.id ? 'shake' : '',
        ]"
        :disabled="tile.used || locked"
        @click="tap(tile)"
      >
        {{ tile.c }}
      </button>
    </div>
    <KidButton v-if="locked" class="bounce-in" color="bg-ink" @click="next">下一班車 GO！</KidButton>
  </div>
</template>
