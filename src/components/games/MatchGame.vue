<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import KidButton from "../KidButton.vue";
import GameHud from "../GameHud.vue";
import { addStars, cuteOops, cuteYeah, sfxCorrect, sfxTap, sfxWrong, shuffle } from "../../lib/fun";

const props = defineProps({
  pairs: { type: Array, required: true },
});
const emit = defineEmits(["done"]);

const left = ref([]);
const right = ref([]);
const selectedLeft = ref(null);
const linked = ref({});
const mistakes = ref(0);
const flash = ref("");
const mood = ref("idle");
const shaking = ref(null);
let doneTimer = 0;
let shakeTimer = 0;
let settled = false;

onMounted(() => {
  left.value = shuffle((props.pairs || []).map((pair, i) => ({ i, text: pair.left })));
  right.value = shuffle((props.pairs || []).map((pair, i) => ({ i, text: pair.right })));
});

onUnmounted(() => {
  if (doneTimer) window.clearTimeout(doneTimer);
  if (shakeTimer) window.clearTimeout(shakeTimer);
});

function complete() {
  if (settled) return;
  settled = true;
  if (doneTimer) window.clearTimeout(doneTimer);
  emit("done", { score: Math.max(props.pairs.length - mistakes.value, 0), total: props.pairs.length });
}

const doneCount = computed(() => Object.keys(linked.value).length);

function pickLeft(item) {
  if (settled || linked.value[item.i] !== undefined) return;
  selectedLeft.value = item.i;
  mood.value = "wow";
  sfxTap();
}

function pickRight(item) {
  if (settled || selectedLeft.value === null) return;
  if (Object.values(linked.value).includes(item.i)) return;
  if (selectedLeft.value === item.i) {
    linked.value = { ...linked.value, [item.i]: item.i };
    selectedLeft.value = null;
    flash.value = cuteYeah();
    mood.value = "happy";
    sfxCorrect();
    addStars(1);
    if (doneCount.value === props.pairs.length) {
      doneTimer = window.setTimeout(complete, 500);
    }
  } else {
    mistakes.value += 1;
    shaking.value = item.i;
    flash.value = cuteOops();
    mood.value = "sad";
    sfxWrong();
    selectedLeft.value = null;
    if (shakeTimer) window.clearTimeout(shakeTimer);
    shakeTimer = window.setTimeout(() => {
      shaking.value = null;
    }, 450);
  }
}
</script>

<template>
  <div class="space-y-4">
    <GameHud
      :round="doneCount"
      :total="pairs.length"
      :label="`已配對 ${doneCount} / ${pairs.length}`"
      :progress="flash"
      :mood="mood"
      :say="flash || '牽手吧～'"
    />
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-3">
        <button
          v-for="item in left"
          :key="'l' + item.i"
          class="flex min-h-[3.75rem] w-full items-center justify-center rounded-2xl px-3 py-3 text-center text-lg font-black leading-snug shadow-chunky transition"
          :class="
            linked[item.i] !== undefined
              ? 'bg-grass text-white pop'
              : selectedLeft === item.i
                ? 'bg-sun text-ink pulse-soft'
                : 'bg-white hover:scale-[1.02]'
          "
          @click="pickLeft(item)"
        >
          {{ item.text }}
        </button>
      </div>
      <div class="space-y-3">
        <button
          v-for="item in right"
          :key="'r' + item.i"
          class="flex min-h-[3.75rem] w-full items-center justify-center rounded-2xl px-3 py-3 text-center text-lg font-black leading-snug shadow-chunky transition"
          :class="[
            Object.values(linked).includes(item.i) ? 'bg-grass text-white pop' : 'bg-white hover:scale-[1.02]',
            shaking === item.i ? 'shake' : '',
          ]"
          @click="pickRight(item)"
        >
          {{ item.text }}
        </button>
      </div>
    </div>
    <KidButton v-if="doneCount === pairs.length && pairs.length" class="bounce-in" color="bg-ink" @click="complete">
      完成
    </KidButton>
  </div>
</template>
