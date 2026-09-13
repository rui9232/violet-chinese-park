<script setup>
import { computed, onUnmounted, ref, watch } from "vue";
import KidButton from "../KidButton.vue";
import GameHud from "../GameHud.vue";
import Sparkles from "../Sparkles.vue";
import Stamp from "../Stamp.vue";
import { speakChinese, stopSpeaking } from "../../lib/studio";
import { addStars, cuteOops, cuteYeah, sfxCorrect, sfxTap, sfxWrong } from "../../lib/fun";

const props = defineProps({
  items: { type: Array, required: true },
});
const emit = defineEmits(["done"]);

const index = ref(0);
const score = ref(0);
const combo = ref(0);
const picked = ref(null);
const locked = ref(false);
const mood = ref("wow");
const sparkle = ref(false);
const say = ref("豎起耳朵～");
const stamp = ref("");

const current = computed(() => props.items[index.value]);
const finished = computed(() => index.value >= props.items.length);
const correct = computed(() => picked.value !== null && picked.value === current.value?.answer);

watch(
  () => current.value?.speak,
  (text) => {
    if (text) speakChinese(text);
  },
  { immediate: true }
);

onUnmounted(stopSpeaking);

function play() {
  if (!current.value?.speak) return;
  speakChinese(current.value.speak);
  mood.value = "wow";
  say.value = "我再說一次！";
  sfxTap();
}

function choose(i) {
  if (locked.value || finished.value || !current.value) return;
  sfxTap();
  picked.value = i;
  locked.value = true;
  if (i === current.value.answer) {
    score.value += 1;
    combo.value += 1;
    mood.value = "happy";
    sparkle.value = true;
    say.value = cuteYeah();
    stamp.value = "聽到了";
    sfxCorrect();
    addStars(1);
  } else {
    combo.value = 0;
    mood.value = "sad";
    say.value = cuteOops();
    stamp.value = "再聽";
    sfxWrong();
  }
}

function next() {
  picked.value = null;
  locked.value = false;
  sparkle.value = false;
  stamp.value = "";
  mood.value = "idle";
  say.value = "下一句來了";
  index.value += 1;
  if (index.value >= props.items.length) {
    emit("done", { score: score.value, total: props.items.length });
  }
}
</script>

<template>
  <div v-if="!finished && current" class="relative space-y-5">
    <Sparkles :show="sparkle" />
    <Stamp v-if="locked" :text="stamp" :good="correct" />
    <GameHud :round="index + 1" :total="items.length" :mood="mood" :say="say" />
    <KidButton class="w-full pulse-soft" color="bg-sky" @click="play">🐰 再聽一次</KidButton>
    <div class="grid gap-3">
      <button
        v-for="(option, i) in current.options"
        :key="`${index}-${i}`"
        class="min-h-[3.5rem] rounded-[1.6rem] bg-white px-4 py-4 text-left text-xl font-black leading-snug shadow-chunky transition"
        :class="
          picked === null
            ? 'hover:scale-[1.03] hover:rotate-1'
            : i === current.answer
              ? '!bg-grass text-white pop'
              : i === picked
                ? '!bg-berry text-white shake'
                : 'opacity-50'
        "
        @click="choose(i)"
      >
        {{ option }}
      </button>
    </div>
    <KidButton v-if="locked" class="bounce-in" color="bg-ink" @click="next">下一關 GO！</KidButton>
  </div>
</template>
