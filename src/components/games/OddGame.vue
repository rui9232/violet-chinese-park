<script setup>
import { computed, ref, watch } from "vue";
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
const combo = ref(0);
const picked = ref(null);
const locked = ref(false);
const mood = ref("wow");
const say = ref("找出不一樣的！");
const sparkle = ref(false);
const stamp = ref("");
const suspects = ref([]);

const current = computed(() => props.items[index.value]);
const finished = computed(() => index.value >= props.items.length);
const correctPick = computed(() => picked.value !== null && suspects.value[picked.value]?.correct);

watch(
  () => current.value,
  (item) => {
    if (!item) return;
    suspects.value = shuffle(
      item.options.map((text, i) => ({
        text,
        icon: item.icons?.[i] || ["🍎", "🍋", "🍇", "🍑"][i % 4],
        correct: i === item.answer,
      }))
    );
  },
  { immediate: true }
);

function choose(i) {
  if (locked.value || finished.value) return;
  sfxTap();
  picked.value = i;
  locked.value = true;
  if (suspects.value[i].correct) {
    score.value += 1;
    combo.value += 1;
    mood.value = "happy";
    sparkle.value = true;
    say.value = current.value.why ? `抓到了！${current.value.why}` : cuteYeah();
    stamp.value = combo.value >= 3 ? `${combo.value} 連擊` : "抓到";
    sfxCorrect();
    addStars(combo.value >= 3 ? 2 : 1);
  } else {
    combo.value = 0;
    mood.value = "sad";
    say.value = current.value.why ? `提示：${current.value.why}` : cuteOops();
    stamp.value = "不是他";
    sfxWrong();
  }
}

function next() {
  picked.value = null;
  locked.value = false;
  sparkle.value = false;
  stamp.value = "";
  mood.value = "wow";
  say.value = "下一組來了！";
  index.value += 1;
  if (index.value >= props.items.length) {
    emit("done", { score: score.value, total: props.items.length });
  }
}

function tone(i) {
  if (picked.value === null) return "bg-white hover:-rotate-2 hover:scale-[1.03]";
  if (suspects.value[i].correct) return "bg-grass text-white pop";
  if (i === picked.value) return "bg-berry text-white shake";
  return "bg-white/70 text-ink/40";
}
</script>

<template>
  <div v-if="!finished && current" class="relative space-y-5">
    <Sparkles :show="sparkle" />
    <Stamp v-if="locked" :text="stamp" :good="correctPick" />
    <GameHud
      :round="index + 1"
      :total="items.length"
      unit="案"
      :progress="combo > 1 ? `連擊 x${combo} 🔥` : '誰是小壞蛋？'"
      :mood="mood"
      :say="say"
      hint="四個裡面有一個跟大家不一樣，點它！"
    />
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="(item, i) in suspects"
        :key="`${index}-${item.text}-${i}`"
        type="button"
        class="flex min-h-[8.5rem] flex-col items-center justify-center rounded-[1.6rem] px-3 py-4 text-center shadow-chunky transition"
        :class="tone(i)"
        @click="choose(i)"
      >
        <span class="block text-4xl">{{ item.icon }}</span>
        <span class="mt-2 block text-xl font-black">{{ item.text }}</span>
      </button>
    </div>
    <KidButton v-if="locked" class="bounce-in" color="bg-ink" @click="next">
      {{ correctPick ? "下一案 GO！" : "換一組！" }}
    </KidButton>
  </div>
</template>
