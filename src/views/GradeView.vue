<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { GAME_TYPES, GRADES } from "../data/catalog";
import KidButton from "../components/KidButton.vue";
import Mascot from "../components/Mascot.vue";
import { sfxTap } from "../lib/fun";

const route = useRoute();
const router = useRouter();
const grade = computed(() => GRADES.find((item) => item.id === Number(route.params.grade)));
const arcadeGames = computed(() => GAME_TYPES.filter((game) => game.arcade));
const radicalGames = computed(() => GAME_TYPES.filter((game) => game.radical));
const brainGames = computed(() => GAME_TYPES.filter((game) => !game.arcade && !game.radical));

function play(type) {
  if (!grade.value) return;
  sfxTap();
  router.push(`/grade/${grade.value.id}/play/${type}`);
}
</script>

<template>
  <div v-if="grade" class="space-y-6">
    <KidButton color="bg-white !text-ink" @click="router.push('/')">← 回地圖</KidButton>
    <header class="island overflow-hidden rounded-[1.75rem] p-5 text-white bounce-in" :class="grade.color">
      <div class="flex items-center gap-4">
        <Mascot class="shrink-0" mood="wow" size="xs" say="選一個玩！" />
        <div class="min-w-0">
          <p class="font-display text-base opacity-90">第 {{ grade.id }} 島</p>
          <h1 class="font-display text-3xl leading-tight md:text-4xl">{{ grade.theme }}</h1>
          <p class="mt-1 font-bold leading-snug text-white/90">{{ grade.title }} · {{ grade.blurb }}</p>
        </div>
      </div>
    </header>
    <section>
      <h2 class="mb-3 font-display text-2xl md:text-3xl">動一動 🏃‍♂️</h2>
      <div class="card-grid">
        <button
          v-for="(game, i) in arcadeGames"
          :key="game.id"
          class="sticker-card game-tile p-4 transition hover:-translate-y-1 bounce-in sm:p-5"
          :style="{ animationDelay: `${i * 50}ms` }"
          @click="play(game.id)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-4xl leading-none">{{ game.emoji }}</span>
            <span
              v-if="game.fresh"
              class="inline-flex h-7 items-center rounded-full bg-berry px-2 text-xs font-black text-white"
            >
              會動
            </span>
          </div>
          <h3 class="mt-3 font-display text-2xl leading-tight">{{ game.name }}</h3>
          <p class="mt-1 min-h-[2.75rem] font-bold leading-snug text-ink/60">{{ game.desc }}</p>
        </button>
      </div>
    </section>
    <section>
      <h2 class="mb-3 font-display text-2xl md:text-3xl">學部首 📖</h2>
      <div class="card-grid">
        <button
          v-for="(game, i) in radicalGames"
          :key="game.id"
          class="sticker-card game-tile p-4 transition hover:-translate-y-1 bounce-in sm:p-5"
          :style="{ animationDelay: `${i * 50}ms` }"
          @click="play(game.id)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-4xl leading-none">{{ game.emoji }}</span>
            <span
              v-if="game.fresh"
              class="inline-flex h-7 items-center rounded-full bg-grape px-2 text-xs font-black text-white"
            >
              部首
            </span>
          </div>
          <h3 class="mt-3 font-display text-2xl leading-tight">{{ game.name }}</h3>
          <p class="mt-1 min-h-[2.75rem] font-bold leading-snug text-ink/60">{{ game.desc }}</p>
        </button>
      </div>
    </section>
    <section>
      <h2 class="mb-3 font-display text-2xl md:text-3xl">動腦筋 🧠</h2>
      <div class="card-grid">
        <button
          v-for="(game, i) in brainGames"
          :key="game.id"
          class="sticker-card game-tile p-4 transition hover:-translate-y-1 bounce-in sm:p-5"
          :style="{ animationDelay: `${i * 50}ms` }"
          @click="play(game.id)"
        >
          <span class="text-4xl leading-none">{{ game.emoji }}</span>
          <h3 class="mt-3 font-display text-2xl leading-tight">{{ game.name }}</h3>
          <p class="mt-1 min-h-[2.75rem] font-bold leading-snug text-ink/60">{{ game.desc }}</p>
        </button>
      </div>
    </section>
  </div>
  <div v-else class="sticker-card space-y-4 p-8 text-center">
    <p class="font-display text-2xl">找不到這座島</p>
    <KidButton color="bg-ink" @click="router.push('/')">回探險地圖</KidButton>
  </div>
</template>
