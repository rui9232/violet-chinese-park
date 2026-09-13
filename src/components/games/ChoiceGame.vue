<script setup>
import { computed, ref } from "vue";
import KidButton from "../KidButton.vue";
import GameHud from "../GameHud.vue";
import Sparkles from "../Sparkles.vue";
import Stamp from "../Stamp.vue";
import { addStars, cuteOops, cuteYeah, sfxCorrect, sfxTap, sfxWrong } from "../../lib/fun";

const props = defineProps({
  items: { type: Array, required: true },
  promptKey: { type: String, default: "q" },
});
const emit = defineEmits(["done"]);

const index = ref(0);
const score = ref(0);
const combo = ref(0);
const picked = ref(null);
const locked = ref(false);
const mood = ref("idle");
const sparkle = ref(false);
const say = ref("選一個吧～");
const stamp = ref("");

const current = computed(() => props.items[index.value]);
const finished = computed(() => index.value >= props.items.length);
const correct = computed(() => picked.value !== null && picked.value === current.value?.answer);

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
    stamp.value = combo.value >= 3 ? `${combo.value} 連擊` : "好棒";
    sfxCorrect();
    addStars(combo.value >= 3 ? 2 : 1);
  } else {
    combo.value = 0;
    mood.value = "sad";
    say.value = cuteOops();
    stamp.value = "再試";
    sfxWrong();
  }
}

function next() {
  picked.value = null;
  locked.value = false;
  sparkle.value = false;
  stamp.value = "";
  mood.value = "idle";
  say.value = "下一題來了！";
  index.value += 1;
  if (index.value >= props.items.length) {
    emit("done", { score: score.value, total: props.items.length });
  }
}

function tone(i) {
  if (picked.value === null) return "bg-white text-ink hover:scale-[1.03] hover:-rotate-1";
  if (i === current.value.answer) return "bg-grass text-white pop";
  if (i === picked.value) return "bg-berry text-white shake";
  return "bg-white/70 text-ink/50";
}
</script>

<template>
  <div v-if="!finished && current" class="relative space-y-5">
    <Sparkles :show="sparkle" />
    <Stamp v-if="locked" :text="stamp" :good="correct" />
    <GameHud
      :round="index + 1"
      :total="items.length"
      :progress="combo > 1 ? `連擊 x${combo} 🔥` : ''"
      :mood="mood"
      :say="say"
    />
    <h2 :key="index" class="font-display text-3xl leading-snug slide-up">
      {{ current[promptKey] || current.q }}
    </h2>
    <div class="grid gap-3">
      <button
        v-for="(option, i) in current.options"
        :key="`${index}-${i}`"
        class="rounded-[1.6rem] px-4 py-4 text-left text-xl font-bold leading-snug shadow-chunky transition"
        :class="tone(i)"
        @click="choose(i)"
      >
        <span class="mr-2 text-lg">{{ ["🍎", "🍋", "🍇", "🍑"][i % 4] }}</span>
        {{ option }}
      </button>
    </div>
    <KidButton v-if="locked" class="bounce-in" color="bg-ink" @click="next">
      {{ correct ? "下一關 GO！" : "換一題！" }}
    </KidButton>
  </div>
</template>
