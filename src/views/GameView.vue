<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ChoiceGame from "../components/games/ChoiceGame.vue";
import MatchGame from "../components/games/MatchGame.vue";
import MemoryGame from "../components/games/MemoryGame.vue";
import ListenGame from "../components/games/ListenGame.vue";
import MoleGame from "../components/games/MoleGame.vue";
import OrderGame from "../components/games/OrderGame.vue";
import OddGame from "../components/games/OddGame.vue";
import HuntGame from "../components/games/HuntGame.vue";
import DashGame from "../components/games/DashGame.vue";
import BalloonGame from "../components/games/BalloonGame.vue";
import KidButton from "../components/KidButton.vue";
import Mascot from "../components/Mascot.vue";
import Confetti from "../components/Confetti.vue";
import { packToGame } from "../data/packs";
import { GAME_TYPES } from "../data/catalog";
import { getCustomGame } from "../lib/studio";
import { getStars, sfxWin } from "../lib/fun";

const route = useRoute();
const router = useRouter();
const result = ref(null);
const round = ref(0);
const intro = ref(true);
const stars = ref(getStars());
let introTimer = 0;

const game = computed(() => {
  if (route.params.code) {
    return getCustomGame(route.params.code);
  }
  return packToGame(Number(route.params.grade), route.params.type);
});

const meta = computed(() => GAME_TYPES.find((item) => item.id === game.value?.type));
const playable = computed(() => {
  const current = game.value;
  if (!current) return false;
  if (current.type === "match" || current.type === "memory" || current.type === "roots") {
    return Boolean(current.pairs?.length);
  }
  return Boolean(current.items?.length);
});
const sticker = computed(() => {
  if (!result.value) return "⭐";
  const ratio = result.value.score / Math.max(result.value.total, 1);
  if (ratio === 1) return "🦄";
  if (ratio >= 0.7) return "🌈";
  return "🍀";
});

function startIntro() {
  intro.value = true;
  result.value = null;
  if (introTimer) window.clearTimeout(introTimer);
  introTimer = window.setTimeout(() => {
    intro.value = false;
    introTimer = 0;
  }, 1400);
}

watch(
  () => route.fullPath,
  () => {
    round.value += 1;
    startIntro();
  }
);

onMounted(startIntro);
onUnmounted(() => {
  if (introTimer) window.clearTimeout(introTimer);
});

function replay() {
  round.value += 1;
  startIntro();
}

function finish(payload) {
  if (result.value) return;
  result.value = payload;
  stars.value = getStars();
  sfxWin();
}
</script>

<template>
  <div class="space-y-4">
    <KidButton
      v-if="route.params.grade"
      color="bg-white !text-ink"
      @click="router.push(`/grade/${route.params.grade}`)"
    >
      ← 回島上
    </KidButton>
    <KidButton v-else color="bg-white !text-ink" @click="router.push('/')">← 回地圖</KidButton>

    <section v-if="!game" class="sticker-card p-8 text-center bounce-in">
      <p class="font-display text-2xl">找不到這個遊戲</p>
      <KidButton class="mt-4" color="bg-ink" @click="router.push('/')">回探險地圖</KidButton>
    </section>

    <section v-else-if="!playable" class="sticker-card p-8 text-center bounce-in">
      <p class="font-display text-2xl">這個關卡還沒有題目</p>
      <KidButton class="mt-4" color="bg-ink" @click="router.push('/')">回探險地圖</KidButton>
    </section>

    <section v-else-if="intro" class="sticker-card p-8 text-center md:p-10">
      <p class="font-display text-6xl">{{ meta?.emoji }}</p>
      <h2 class="mt-3 font-display text-5xl">出發囉！</h2>
      <p class="mt-2 text-lg font-bold text-ink/70">{{ game.title }} · {{ meta?.name }}</p>
      <div class="mt-5 flex justify-center">
        <Mascot mood="wow" say="跟著我衝呀！" />
      </div>
    </section>

    <section v-else-if="result" class="sticker-card relative overflow-hidden p-8 text-center">
      <Confetti />
      <p class="text-7xl bounce-in">{{ sticker }}</p>
      <div class="mt-2 flex justify-center">
        <Mascot mood="happy" size="xl" say="你超棒的啦！" />
      </div>
      <h2 class="mt-2 font-display text-5xl">過關！</h2>
      <p class="mt-2 text-xl font-bold">得到 {{ Math.max(result.score, 0) }} / {{ result.total }} 顆星星</p>
      <p class="mt-1 font-display text-lg text-berry">星星罐裡一共 {{ stars }} 顆 ⭐</p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <KidButton color="bg-sun" @click="replay">再玩一場</KidButton>
        <KidButton color="bg-ink" @click="router.push(route.params.grade ? `/grade/${route.params.grade}` : '/')">
          回地圖
        </KidButton>
      </div>
    </section>

    <section v-else class="sticker-card p-4 bounce-in sm:p-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="font-display text-base text-berry">{{ meta?.name }}大冒險</p>
          <h1 class="truncate text-xl font-black sm:text-2xl">{{ game.title }}</h1>
        </div>
        <p class="inline-flex h-9 shrink-0 items-center rounded-full bg-sun px-3 font-black">⭐ {{ stars }}</p>
      </div>
      <ChoiceGame
        v-if="game.type === 'choice' || game.type === 'fill' || game.type === 'bushou'"
        :key="round"
        :items="game.items || []"
        @done="finish"
      />
      <MatchGame
        v-else-if="game.type === 'match' || game.type === 'roots'"
        :key="round"
        :pairs="game.pairs || []"
        @done="finish"
      />
      <MemoryGame v-else-if="game.type === 'memory'" :key="round" :pairs="game.pairs || []" @done="finish" />
      <ListenGame v-else-if="game.type === 'listen'" :key="round" :items="game.items || []" @done="finish" />
      <MoleGame v-else-if="game.type === 'mole'" :key="round" :items="game.items || []" @done="finish" />
      <DashGame v-else-if="game.type === 'dash'" :key="round" :items="game.items || []" @done="finish" />
      <BalloonGame v-else-if="game.type === 'balloon'" :key="round" :items="game.items || []" @done="finish" />
      <OrderGame v-else-if="game.type === 'order'" :key="round" :items="game.items || []" @done="finish" />
      <OddGame
        v-else-if="game.type === 'odd' || game.type === 'family'"
        :key="round"
        :items="game.items || []"
        @done="finish"
      />
      <HuntGame v-else-if="game.type === 'hunt'" :key="round" :items="game.items || []" @done="finish" />
      <p v-else class="font-black text-berry">這個玩法還不能玩，請回地圖再選一次。</p>
    </section>
  </div>
</template>
